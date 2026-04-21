import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Info } from "lucide-react";
import { useFormulations } from "@/context/FormulationContext";
import { useBMRs, createDefaultBMR } from "@/context/BMRContext";
import { useStock } from "@/context/StockContext";
import { toast } from "sonner";

const BMRCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formulations } = useFormulations();
  const { addBMR, getNextBatchNo } = useBMRs();
  const { rmData } = useStock();

  const preselectedId = searchParams.get("mfr");
  const [selectedMFR, setSelectedMFR] = useState<string>(preselectedId || "");
  const [batchSize, setBatchSize] = useState<number>(0);
  const [batchNo, setBatchNo] = useState("");
  const [prevBatchNo, setPrevBatchNo] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const mfr = formulations.find((f) => f.id === selectedMFR);

  useEffect(() => {
    if (mfr) {
      const { nextBatchNo, prevBatchNo: prev } = getNextBatchNo(mfr.name, mfr.id);
      setBatchNo(nextBatchNo);
      setPrevBatchNo(prev);
    } else {
      setBatchNo("");
      setPrevBatchNo(null);
    }
  }, [selectedMFR, mfr]);

  const scaleFactor = useMemo(() => {
    if (!mfr || !batchSize || !mfr.standardBatchSize) return 0;
    return batchSize / mfr.standardBatchSize;
  }, [mfr, batchSize]);

  const handleCreate = () => {
    if (!mfr || scaleFactor <= 0) return;

    const defaultIpcChecks = [
      { check: "Uniformity of mixing", description: "Visual & content uniformity", specification: "Uniform colour & texture", observedValue: "", unit: "—", checkedAt: "", result: "" as const },
      { check: "Moisture content (LOD)", description: "Moisture analyser", specification: "NMT 8.0%", observedValue: "", unit: "%", checkedAt: "", result: "" as const },
      { check: "Particle size", description: "Sieve analysis", specification: "NLT 80% pass 80 mesh", observedValue: "", unit: "%", checkedAt: "", result: "" as const },
      { check: "Bulk density", description: "Graduated cylinder", specification: "0.35–0.65 g/mL", observedValue: "", unit: "g/mL", checkedAt: "", result: "" as const },
      { check: "Tapped density", description: "Tap density tester", specification: "0.45–0.85 g/mL", observedValue: "", unit: "g/mL", checkedAt: "", result: "" as const },
      { check: "pH (1% suspension)", description: "pH meter", specification: "3.0–6.0", observedValue: "", unit: "—", checkedAt: "", result: "" as const },
    ];

    const bmr = createDefaultBMR({
      batchNo,
      productName: mfr.name,
      mfrId: mfr.id,
      mfrName: `${mfr.name} (${mfr.type})`,
      batchSize,
      batchUnit: mfr.standardBatchUnit,
      scaleFactor,
      startDate,
      mfrRef: `${mfr.name} / ${mfr.ref}`,
      pharmacopoeiaRef: mfr.ref,
      ingredients: mfr.rm.map((rm) => {
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean);
        const tokens = norm(rm.name);
        const match = rmData.find(r => {
          const rt = norm(r.name);
          return tokens.some(t => rt.some(x => x.includes(t) || t.includes(x))) ||
            r.name.toLowerCase().includes(rm.name.toLowerCase()) ||
            rm.name.toLowerCase().includes(r.name.toLowerCase());
        });
        return {
          name: rm.name,
          rmCode: match?.code,
          cat: rm.cat,
          requiredQty: rm.unit === "q.s." ? 0 : Number((rm.qty * scaleFactor).toFixed(3)),
          actualQty: 0,
          unit: rm.unit,
          part: rm.part,
          lot: "",
          cost: 0,
        };
      }),
      steps: mfr.steps.map((s, i) => ({
        step: s.step,
        description: s.equipment || "",
        equipment: s.equipment,
        duration: s.duration,
        temp: s.temp,
        ipcCheck: s.ipcCheck,
        status: i === 0 ? "current" as const : "todo" as const,
      })),
      ipcChecks: defaultIpcChecks,
      qcParams: mfr.qc.map((q) => ({ parameter: q.parameter, spec: q.spec, result: "", compliance: "" as const })),
      theoreticalYield: Number((batchSize * ((mfr.expectedYieldPct ?? 98) / 100)).toFixed(3)),
      blendWeight: { theoreticalBlendWt: String(batchSize), actualBlendWt: "", lossOnBlending: "", yieldAtBlendStage: "" },
      packing: mfr.packaging ? {
        primaryPackSize: mfr.packaging.primaryPackSize || "100 g HDPE jar",
        noOfPrimaryPacks: Math.round((mfr.packaging.defaultPrimaryPacks || 0) * scaleFactor),
        totalQtyPacked: "",
        qcRetainSample: mfr.packaging.qcRetainSample || "20",
        secondaryPack: mfr.packaging.secondaryPack || "",
        noOfShippers: Math.round((mfr.packaging.defaultShippers || 0) * scaleFactor),
        labellingBatchCode: "",
        packingDate: "",
      } : undefined,
    });

    addBMR(bmr);
    toast.success(`BMR ${batchNo} created — opening wizard`);
    navigate(`/bmr/${bmr.id}`);
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Create BMR from Formulation</div>
          <div className="text-[11px] text-muted-foreground mt-px">Select a formulation, set batch size — then proceed to the 6-step wizard</div>
        </div>
        <button onClick={() => navigate(-1)} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Batch setup</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="form-field">
                <label>Select formulation (MFR) *</label>
                <select value={selectedMFR} onChange={(e) => { setSelectedMFR(e.target.value); setBatchSize(0); }}>
                  <option value="">— Select —</option>
                  {formulations.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.type}) — Std: {f.standardBatchSize} {f.standardBatchUnit}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Batch number</label>
                <input value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
                {mfr && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <Info className="w-3 h-3" />
                    {prevBatchNo ? `Previous: ${prevBatchNo}` : "First batch for this product"}
                  </div>
                )}
              </div>
            </div>
            {mfr && (
              <div className="grid grid-cols-3 gap-3">
                <div className="form-field">
                  <label>Required batch size ({mfr.standardBatchUnit}) *</label>
                  <input type="number" value={batchSize || ""} onChange={(e) => setBatchSize(Number(e.target.value))} min={0} step="0.1" placeholder={`Std: ${mfr.standardBatchSize}`} />
                </div>
                <div className="form-field"><label>Start date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="flex items-end pb-1">
                  <div className="kpi-card flex-1 !p-2.5">
                    <div className="text-[10px] text-muted-foreground">Scale factor</div>
                    <div className="text-lg font-bold text-primary">{scaleFactor ? `${scaleFactor.toFixed(2)}×` : "—"}</div>
                    <div className="text-[10px] text-muted-foreground">Std batch: {mfr.standardBatchSize} {mfr.standardBatchUnit}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mfr && scaleFactor > 0 && (
        <div className="flex items-center justify-end px-5 py-3 border-t border-border bg-secondary shrink-0">
          <button onClick={handleCreate} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Create BMR & open wizard
          </button>
        </div>
      )}
    </>
  );
};

export default BMRCreate;
