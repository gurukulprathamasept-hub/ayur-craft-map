import { BMRRecord, BMRIPCCheck } from "@/context/BMRContext";
import { Info } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const Step4IPCChecks = ({ bmr, onChange }: Props) => {
  const updateCheck = (idx: number, updates: Partial<BMRIPCCheck>) => {
    const ipcChecks = bmr.ipcChecks.map((c, i) => i === idx ? { ...c, ...updates } : c);
    onChange({ ipcChecks });
  };

  const passCount = bmr.ipcChecks.filter(c => c.result === "pass").length;
  const failCount = bmr.ipcChecks.filter(c => c.result === "fail").length;

  const resultClass = (r: string) =>
    r === "pass" ? "form-input-sm !border-primary !bg-[hsl(var(--badge-green-bg))] !text-[hsl(var(--badge-green-text))] font-medium"
    : r === "fail" ? "form-input-sm !border-destructive !bg-[hsl(var(--badge-red-bg))] !text-[hsl(var(--badge-red-text))] font-medium"
    : "form-input-sm";

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.13: IPC records — uniformity of mixing, moisture content, weight variation, pH, disintegration time. Product-specific checks.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">In-process quality checks</div>
          <span className="app-badge app-badge-purple">{bmr.dosageForm || "Product specific"}</span>
        </div>
        <div className="p-3.5 overflow-x-auto">
          <div className="grid grid-cols-[1.8fr_1.2fr_1fr_1.2fr_1fr_80px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div>Check</div><div>Specification / limit</div><div>Observed value</div><div>Unit</div><div>Checked at</div><div>Result</div>
          </div>
          {bmr.ipcChecks.map((c, i) => (
            <div key={i} className="grid grid-cols-[1.8fr_1.2fr_1fr_1.2fr_1fr_80px] gap-2 py-1.5 items-center text-xs border-b border-border last:border-0">
              <div>
                <div className="font-medium">{c.check}</div>
                {c.description && <div className="text-[10px] text-muted-foreground">{c.description}</div>}
              </div>
              <div className="text-muted-foreground text-[11px]">{c.specification}</div>
              <div>
                <input className="form-input-sm w-full" value={c.observedValue} onChange={e => updateCheck(i, { observedValue: e.target.value })} />
              </div>
              <div className="text-muted-foreground text-[11px]">{c.unit}</div>
              <div>
                <input className="form-input-sm w-[70px]" value={c.checkedAt} onChange={e => updateCheck(i, { checkedAt: e.target.value })} placeholder="HH:MM" />
              </div>
              <div>
                <select className={resultClass(c.result)} value={c.result} onChange={e => updateCheck(i, { result: e.target.value as BMRIPCCheck["result"] })}>
                  <option value="">—</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
          ))}
          {bmr.ipcChecks.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">No IPC checks defined. Add checks from the formulation template.</div>
          )}
        </div>
      </div>

      <div className="app-card">
        <div className="app-card-head"><div className="app-card-title">IPC summary</div></div>
        <div className="p-3.5 grid grid-cols-3 gap-2.5">
          <div className="bg-secondary rounded-md p-2.5 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Total checks</div>
            <div className="text-xl font-medium">{bmr.ipcChecks.length}</div>
          </div>
          <div className="bg-[hsl(var(--badge-green-bg))] rounded-md p-2.5 text-center">
            <div className="text-[10px] text-[hsl(var(--badge-green-text))] mb-1">Pass</div>
            <div className="text-xl font-medium text-[hsl(var(--badge-green-text))]">{passCount}</div>
          </div>
          <div className="bg-[hsl(var(--badge-red-bg))] rounded-md p-2.5 text-center">
            <div className="text-[10px] text-[hsl(var(--badge-red-text))] mb-1">Fail</div>
            <div className="text-xl font-medium text-[hsl(var(--badge-red-text))]">{failCount}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step4IPCChecks;
