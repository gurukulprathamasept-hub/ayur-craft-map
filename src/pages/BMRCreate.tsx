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
  // Multi-select: map of packSize index -> qty (in batchUnit) allocated to that pack
  const [packAllocations, setPackAllocations] = useState<Record<number, number>>({});

  const mfr = formulations.find((f) => f.id === selectedMFR);

  // Resolve pack sizes (handle legacy single-pack shape)
  const packSizes = useMemo(() => {
    if (!mfr?.packaging) return [];
    const pk: any = mfr.packaging;
    if (Array.isArray(pk.packSizes) && pk.packSizes.length > 0) return pk.packSizes;
    if (pk.primaryPackSize) {
      return [{
        label: pk.primaryPackSize,
        primaryPacksPerStdBatch: pk.defaultPrimaryPacks || 0,
        secondaryPack: pk.secondaryPack || "",
        shippersPerStdBatch: pk.defaultShippers || 0,
      }];
    }
    return [];
  }, [mfr]);

  useEffect(() => {
    if (mfr) {
      const { nextBatchNo, prevBatchNo: prev } = getNextBatchNo(mfr.name, mfr.id, mfr.batchPrefix);
      setBatchNo(nextBatchNo);
      setPrevBatchNo(prev);
      setPackAllocations({});
    } else {
      setBatchNo("");
      setPrevBatchNo(null);
    }
  }, [selectedMFR, mfr]);

  const scaleFactor = useMemo(() => {
    if (!mfr || !batchSize || !mfr.standardBatchSize) return 0;
    return batchSize / mfr.standardBatchSize;
  }, [mfr, batchSize]);

  // Parse pack size label like "100 g HDPE jar" / "1 kg pouch" / "500 ml" → qty in batchUnit
  const parsePackWeight = (label: string, batchUnit: string): number => {
    if (!label) return 0;
    const m = label.match(/(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml)\b/i);
    if (!m) return 0;
    const val = parseFloat(m[1]);
    const unit = m[2].toLowerCase();
    const toBase: Record<string, number> = { mg: 0.000001, g: 0.001, kg: 1, ml: 0.001, l: 1 };
    const base = val * (toBase[unit] ?? 0); // in kg or l
    const targetFactor: Record<string, number> = { mg: 1_000_000, g: 1000, kg: 1, ml: 1000, l: 1 };
    return base * (targetFactor[batchUnit.toLowerCase()] ?? 1);
  };

  const totalAllocated = useMemo(
    () => Object.values(packAllocations).reduce((s, v) => s + (Number(v) || 0), 0),
    [packAllocations]
  );
  const allocationOk = packSizes.length === 0 || (totalAllocated > 0 && Math.abs(totalAllocated - batchSize) < 0.001);

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
      productNameHi: (mfr as any).nameHi || mfr.sanskrit || "",
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
          nameHi: (rm as any).nameHi || match?.nameHi || "",
          rmCode: match?.code,
          cat: rm.cat,
          requiredQty: rm.unit === "q.s." ? 0 : Number((rm.qty * scaleFactor).toFixed(3)),
          actualQty: 0,
          unit: rm.unit,
          part: rm.part,
          lot: "",
          cost: 0,
          botanicalName: (rm as any).botanical || match?.botanical,
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
      packing: packSizes.length > 0 ? (() => {
        const entries = packSizes
          .map((ps: any, i: number) => {
            const qty = Number(packAllocations[i] || 0);
            if (qty <= 0) return null;
            const w = parsePackWeight(ps.label, mfr.standardBatchUnit);
            const noOfPacks = w > 0 ? Math.floor(qty / w) : Math.round((ps.primaryPacksPerStdBatch || 0) * (qty / mfr.standardBatchSize));
            const shippers = Math.round((ps.shippersPerStdBatch || 0) * (qty / mfr.standardBatchSize));
            return {
              primaryPackSize: ps.label,
              noOfPrimaryPacks: noOfPacks,
              secondaryPack: ps.secondaryPack || "",
              noOfShippers: shippers,
              qtyAllocated: qty,
            };
          })
          .filter(Boolean) as any[];
        const first = entries[0] || { primaryPackSize: "100 g HDPE jar", noOfPrimaryPacks: 0, secondaryPack: "", noOfShippers: 0 };
        return {
          primaryPackSize: first.primaryPackSize,
          noOfPrimaryPacks: first.noOfPrimaryPacks,
          totalQtyPacked: "",
          qcRetainSample: mfr.packaging?.qcRetainSample || "20",
          secondaryPack: first.secondaryPack,
          noOfShippers: first.noOfShippers,
          labellingBatchCode: "",
          packingDate: "",
          packEntries: entries,
        };
      })() : undefined,
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
            {mfr && packSizes.length > 0 && batchSize > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium">Pack sizes for this batch * <span className="text-muted-foreground font-normal">(select one or more & allocate qty)</span></label>
                  <div className="text-[10px] text-muted-foreground">
                    Allocated: <span className={allocationOk ? "text-primary font-semibold" : "text-destructive font-semibold"}>{totalAllocated.toFixed(3)}</span> / {batchSize} {mfr.standardBatchUnit}
                  </div>
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary">
                      <tr className="text-left">
                        <th className="px-2 py-1.5 w-8"></th>
                        <th className="px-2 py-1.5">Pack size</th>
                        <th className="px-2 py-1.5 w-32">Qty allocated ({mfr.standardBatchUnit})</th>
                        <th className="px-2 py-1.5 w-32">Primary packs</th>
                        <th className="px-2 py-1.5">Secondary / shippers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packSizes.map((ps: any, i: number) => {
                        const checked = packAllocations[i] !== undefined;
                        const qty = packAllocations[i] || 0;
                        const w = parsePackWeight(ps.label, mfr.standardBatchUnit);
                        const noOfPacks = w > 0 ? Math.floor(qty / w) : Math.round((ps.primaryPacksPerStdBatch || 0) * (qty / mfr.standardBatchSize));
                        const shippers = Math.round((ps.shippersPerStdBatch || 0) * (qty / mfr.standardBatchSize));
                        return (
                          <tr key={i} className="border-t border-border">
                            <td className="px-2 py-1.5">
                              <input type="checkbox" checked={checked} onChange={(e) => {
                                setPackAllocations(prev => {
                                  const next = { ...prev };
                                  if (e.target.checked) next[i] = 0;
                                  else delete next[i];
                                  return next;
                                });
                              }} />
                            </td>
                            <td className="px-2 py-1.5">{ps.label}</td>
                            <td className="px-2 py-1.5">
                              <input type="number" disabled={!checked} value={checked ? (qty || "") : ""} min={0} step="0.001"
                                onChange={(e) => setPackAllocations(prev => ({ ...prev, [i]: Number(e.target.value) }))}
                                className="form-input-sm w-full" />
                            </td>
                            <td className="px-2 py-1.5">{checked && qty > 0 ? `${noOfPacks} packs` : "—"}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">
                              {ps.secondaryPack || "—"}{checked && qty > 0 && ps.shippersPerStdBatch ? ` · ${shippers} shippers` : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <button type="button" onClick={() => {
                    // auto-fill: split remaining equally across selected, or assign full to first if none
                    const selectedIdx = Object.keys(packAllocations).map(Number);
                    if (selectedIdx.length === 0) {
                      setPackAllocations({ 0: batchSize });
                    } else {
                      const each = batchSize / selectedIdx.length;
                      const next: Record<number, number> = {};
                      selectedIdx.forEach(i => { next[i] = Number(each.toFixed(3)); });
                      setPackAllocations(next);
                    }
                  }} className="text-[10px] px-2 py-1 rounded border border-border hover:bg-secondary">
                    Auto-distribute
                  </button>
                  {!allocationOk && (
                    <div className="text-[10px] text-destructive">Total must equal {batchSize} {mfr.standardBatchUnit}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {mfr && scaleFactor > 0 && (
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary shrink-0">
          {!allocationOk && <div className="text-[11px] text-destructive">Allocate full batch qty across pack sizes to continue</div>}
          <button onClick={handleCreate} disabled={!allocationOk}
            className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
            <FileText className="w-3 h-3" /> Create BMR & open wizard
          </button>
        </div>
      )}
    </>
  );
};

export default BMRCreate;
