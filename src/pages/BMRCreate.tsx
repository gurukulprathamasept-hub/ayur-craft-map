import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, Calculator } from "lucide-react";
import { useFormulations } from "@/context/FormulationContext";
import { useBMRs, BMRRecord } from "@/context/BMRContext";
import { toast } from "sonner";

const BMRCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formulations } = useFormulations();

  const preselectedId = searchParams.get("mfr");
  const [selectedMFR, setSelectedMFR] = useState<string>(preselectedId || "");
  const [batchSize, setBatchSize] = useState<number>(0);
  const [batchNo, setBatchNo] = useState(`BMR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const mfr = formulations.find((f) => f.id === selectedMFR);

  const scaleFactor = useMemo(() => {
    if (!mfr || !batchSize || !mfr.standardBatchSize) return 0;
    return batchSize / mfr.standardBatchSize;
  }, [mfr, batchSize]);

  const scaledIngredients = useMemo(() => {
    if (!mfr) return [];
    return mfr.rm.map((rm) => ({
      ...rm,
      scaledQty: rm.unit === "q.s." ? rm.qty : Number((rm.qty * scaleFactor).toFixed(3)),
    }));
  }, [mfr, scaleFactor]);

  const handleCreate = () => {
    toast.success(`BMR ${batchNo} created from ${mfr?.name}`);
    navigate("/bmr");
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Create BMR from Formulation</div>
          <div className="text-[11px] text-muted-foreground mt-px">Select a formulation, set batch size — quantities auto-scale</div>
        </div>
        <button onClick={() => navigate(-1)} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Selection card */}
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
              </div>
            </div>
            {mfr && (
              <div className="grid grid-cols-3 gap-3">
                <div className="form-field">
                  <label>Required batch size ({mfr.standardBatchUnit}) *</label>
                  <input type="number" value={batchSize || ""} onChange={(e) => setBatchSize(Number(e.target.value))} min={0} step="0.1" placeholder={`Std: ${mfr.standardBatchSize}`} />
                </div>
                <div className="form-field"><label>Start date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                <div className="flex items-end pb-1 gap-2">
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

        {/* Scaled ingredients */}
        {mfr && scaleFactor > 0 && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" /> Scaled ingredients — {batchSize} {mfr.standardBatchUnit} batch
              </div>
            </div>
            <div className="p-3.5">
              <div className="grid grid-cols-[2fr_100px_100px_100px_80px_1fr] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                <div>Raw material</div><div>Category</div><div>Std qty</div><div>Required qty</div><div>Unit</div><div>Part used</div>
              </div>
              {scaledIngredients.map((rm, i) => (
                <div key={i} className={`grid grid-cols-[2fr_100px_100px_100px_80px_1fr] gap-2 py-2 items-center text-xs ${i < scaledIngredients.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="font-medium">{rm.name}</div>
                  <div><span className={`app-badge app-badge-${rm.cat === "herb" ? "green" : rm.cat === "mineral" ? "blue" : rm.cat === "animal" ? "red" : rm.cat === "base" ? "purple" : "amber"}`}>{rm.cat}</span></div>
                  <div className="text-muted-foreground">{rm.qty} {rm.unit}</div>
                  <div className="font-semibold text-primary">{rm.unit === "q.s." ? "q.s." : `${rm.scaledQty}`}</div>
                  <div className="text-muted-foreground">{rm.unit}</div>
                  <div className="text-muted-foreground">{rm.part}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process steps */}
        {mfr && scaleFactor > 0 && mfr.steps.length > 0 && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Manufacturing procedure ({mfr.steps.length} steps)
              </div>
            </div>
            <div className="p-3.5">
              <ol className="space-y-2">
                {mfr.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-xs">
                    <div className="step-num step-num-todo shrink-0 text-[9px] w-5 h-5 mt-0.5">{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-foreground leading-relaxed">{s.step}</div>
                      {(s.equipment || s.duration || s.temp) && (
                        <div className="flex gap-3 mt-1">
                          {s.equipment && <span className="app-badge app-badge-gray">{s.equipment}</span>}
                          {s.duration && <span className="app-badge app-badge-blue">{s.duration}</span>}
                          {s.temp && <span className="app-badge app-badge-amber">{s.temp}</span>}
                        </div>
                      )}
                      {s.ipcCheck && <div className="text-[10px] text-muted-foreground mt-1">IPC: {s.ipcCheck}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* QC params */}
        {mfr && scaleFactor > 0 && mfr.qc.length > 0 && (
          <div className="app-card">
            <div className="app-card-head"><div className="app-card-title">QC parameters</div></div>
            <div className="p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {mfr.qc.map((q, i) => (
                  <span key={i} className="app-badge app-badge-gray">{q.parameter}: {q.spec}</span>
                ))}
              </div>
              {mfr.ipc && <div className="text-xs text-muted-foreground mt-3"><strong>IPC:</strong> {mfr.ipc}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {mfr && scaleFactor > 0 && (
        <div className="flex items-center justify-end px-5 py-3 border-t border-border bg-secondary shrink-0">
          <button onClick={handleCreate} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
            <FileText className="w-3 h-3" /> Create BMR
          </button>
        </div>
      )}
    </>
  );
};

export default BMRCreate;
