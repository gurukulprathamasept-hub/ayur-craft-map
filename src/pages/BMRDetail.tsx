import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useBMRs } from "@/context/BMRContext";

const STATUS_BADGE: Record<string, string> = {
  "Draft": "app-badge-gray",
  "In process": "app-badge-blue",
  "QC pending": "app-badge-amber",
  "Released": "app-badge-green",
  "Rejected": "app-badge-red",
};

const CAT_BADGE: Record<string, string> = {
  herb: "app-badge-green",
  extract: "app-badge-amber",
  mineral: "app-badge-blue",
  animal: "app-badge-red",
  base: "app-badge-purple",
  process: "app-badge-teal",
};

const BMRDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBMR, updateBMR } = useBMRs();

  const bmr = getBMR(id || "");

  if (!bmr) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-sm text-muted-foreground mb-2">BMR not found</div>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">
          Back to BMR list
        </button>
      </div>
    );
  }

  const completedSteps = bmr.steps.filter((s) => s.status === "done").length;
  const currentStepIdx = bmr.steps.findIndex((s) => s.status === "current");
  const yieldPct = bmr.theoreticalYield > 0 && bmr.actualYield > 0
    ? ((bmr.actualYield / bmr.theoreticalYield) * 100).toFixed(1)
    : "0";

  const handleStatusChange = (status: typeof bmr.status) => {
    updateBMR(bmr.id, { status });
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">BMR — {bmr.productName}</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {bmr.batchNo} · {bmr.mfrName} · {bmr.status}
          </div>
        </div>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        {bmr.status === "In process" && (
          <button onClick={() => handleStatusChange("QC pending")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
            Send to QC
          </button>
        )}
        {bmr.status === "QC pending" && (
          <>
            <button onClick={() => handleStatusChange("Released")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              Release
            </button>
            <button onClick={() => handleStatusChange("Rejected")} className="px-3.5 py-1.5 rounded-md border border-destructive text-destructive text-xs font-medium hover:bg-destructive/10 transition-all">
              Reject
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-4">
          {bmr.steps.map((step, i) => (
            <div key={i} className="contents">
              {i > 0 && <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />}
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className={`step-num step-num-${step.status}`}>{i + 1}</div>
                <span className={step.status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {step.step.length > 20 ? step.step.slice(0, 20) + "…" : step.step}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Batch header */}
        <div className="app-card mb-2.5">
          <div className="app-card-head">
            <div className="app-card-title">Batch header</div>
            <span className={`app-badge ${STATUS_BADGE[bmr.status]}`}>{bmr.status}</span>
          </div>
          <div className="p-3.5 grid grid-cols-4 gap-2.5 text-xs">
            {[
              ["Product", bmr.productName],
              ["Batch no.", bmr.batchNo],
              ["Batch size", `${bmr.batchSize} ${bmr.batchUnit}`],
              ["MFR reference", bmr.mfrName],
              ["Start date", bmr.startDate],
              ["Scale factor", `${bmr.scaleFactor.toFixed(2)}×`],
              ["Theoretical yield", `${bmr.theoreticalYield} ${bmr.batchUnit}`],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
            <div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Actual yield</div>
              <div className="font-medium">{bmr.actualYield > 0 ? `${bmr.actualYield} ${bmr.batchUnit}` : "—"}</div>
            </div>
          </div>
          <div className="px-3.5 pb-2.5">
            <div className="text-[10px] text-muted-foreground mb-1">Yield progress</div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${yieldPct}%` }} />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="app-card mb-2.5">
          <div className="app-card-head">
            <div className="app-card-title">Ingredient consumption — required quantities</div>
          </div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_80px_1fr_80px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Raw material</div><div>Category</div><div>Reqd. qty</div><div>Part used</div><div>Unit</div>
            </div>
            {bmr.ingredients.map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_80px_1fr_80px] gap-2 py-1.5 items-center text-xs ${i < bmr.ingredients.length - 1 ? "border-b border-border" : ""}`}>
                <div className="font-medium">{item.name}</div>
                <div>
                  <span className={`app-badge ${CAT_BADGE[item.cat] || "app-badge-gray"}`}>{item.cat}</span>
                </div>
                <div className="font-semibold text-primary">
                  {item.unit === "q.s." ? "q.s." : item.requiredQty}
                </div>
                <div className="text-muted-foreground">{item.part}</div>
                <div className="text-muted-foreground">{item.unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Process steps */}
        <div className="app-card mb-2.5">
          <div className="app-card-head">
            <div className="app-card-title">Process log — {completedSteps}/{bmr.steps.length} steps completed</div>
          </div>
          <div className="p-3.5">
            <ol className="space-y-2">
              {bmr.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <div className={`step-num step-num-${s.status} shrink-0 text-[9px] w-5 h-5 mt-0.5`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className={`leading-relaxed ${s.status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {s.step}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {s.equipment && <span className="app-badge app-badge-gray">{s.equipment}</span>}
                      {s.duration && <span className="app-badge app-badge-blue">{s.duration}</span>}
                      {s.temp && <span className="app-badge app-badge-amber">{s.temp}</span>}
                      {s.ipcCheck && <span className="app-badge app-badge-teal">IPC: {s.ipcCheck}</span>}
                    </div>
                    {s.operator && <div className="text-[10px] text-muted-foreground mt-1">Operator: {s.operator}</div>}
                    {s.remarks && <div className="text-[10px] text-muted-foreground mt-0.5">Remarks: {s.remarks}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* QC Parameters */}
        {bmr.qcParams.length > 0 && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title">QC parameters</div>
            </div>
            <div className="p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {bmr.qcParams.map((q, i) => (
                  <span key={i} className="app-badge app-badge-gray">
                    {q.parameter}: {q.spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BMRDetail;
