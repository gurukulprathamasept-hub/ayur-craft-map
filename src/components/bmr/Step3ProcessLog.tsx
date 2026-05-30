import { useState } from "react";
import { BMRRecord, BMRProcessStep, BMRSubProcess, BMRSubProcessIterationLog } from "@/context/BMRContext";
import { Info, Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const Step3ProcessLog = ({ bmr, onChange }: Props) => {
  const subProcesses = bmr.subProcesses || [];
  const [openSP, setOpenSP] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(subProcesses.map((sp) => [sp.id, true]))
  );

  const updateStep = (idx: number, updates: Partial<BMRProcessStep>) => {
    const steps = bmr.steps.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onChange({ steps });
  };

  const updateSP = (spId: string, patch: Partial<BMRSubProcess>) => {
    const next = subProcesses.map((sp) => (sp.id === spId ? { ...sp, ...patch } : sp));
    onChange({ subProcesses: next });
  };

  const statusColor = (s: string) => s === "done" ? "bg-primary" : s === "current" ? "bg-warning" : "bg-border";
  const statusSelectClass = (s: string) => s === "done" ? "form-input-sm !border-primary !bg-[hsl(var(--badge-green-bg))] !text-[hsl(var(--badge-green-text))] font-medium" : s === "current" ? "form-input-sm !border-[hsl(var(--warning))] !bg-[hsl(var(--badge-amber-bg))] !text-[hsl(var(--badge-amber-text))] font-medium" : "form-input-sm";

  const addStep = () => {
    onChange({
      steps: [...bmr.steps, { step: "", status: "todo" as const }],
    });
  };

  // Build merged timeline
  type TItem = { type: "subprocess"; data: BMRSubProcess } | { type: "step"; data: BMRProcessStep; idx: number };
  const timeline: TItem[] = [];
  bmr.steps.forEach((step, idx) => {
    subProcesses
      .filter((sp) => (sp.insertBeforeStepIndex ?? 0) === idx)
      .forEach((sp) => timeline.push({ type: "subprocess", data: sp }));
    timeline.push({ type: "step", data: step, idx });
  });
  subProcesses
    .filter((sp) => (sp.insertBeforeStepIndex ?? 0) >= bmr.steps.length)
    .forEach((sp) => timeline.push({ type: "subprocess", data: sp }));

  const renderSubProcess = (sp: BMRSubProcess) => {
    const isOpen = openSP[sp.id] ?? true;
    const toggle = () => setOpenSP((p) => ({ ...p, [sp.id]: !isOpen }));
    return (
      <div key={`sp-${sp.id}`} className="my-2 rounded-md border border-border bg-primary/5 border-l-4 border-l-primary overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary/10" onClick={toggle}>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-semibold">{sp.type}</span>
          <span className="text-xs font-medium">{sp.name || "Sub-process"}</span>
          {sp.actualYield && <span className="text-[10px] text-muted-foreground ml-auto">→ {sp.actualYield} {sp.actualYieldUnit}</span>}
          <select
            className={statusSelectClass(sp.completionTestResult === "Pass" ? "done" : sp.actualYield ? "current" : "todo")}
            value={sp.completionTestResult === "Pass" ? "done" : sp.actualYield ? "current" : "todo"}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "done") updateSP(sp.id, { completionTestResult: "Pass" });
              else if (v === "current") updateSP(sp.id, { completionTestResult: "" });
              else updateSP(sp.id, { completionTestResult: "", actualYield: "" });
            }}
          >
            <option value="todo">Pending</option>
            <option value="current">In prog.</option>
            <option value="done">Done</option>
          </select>
        </div>
        {isOpen && (
          <div className="p-3 space-y-3 border-t border-border bg-card">
            {sp.description && (
              <div className="text-[11px] text-muted-foreground bg-secondary p-2 rounded">{sp.description}</div>
            )}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {sp.waterRatio && <div><span className="text-muted-foreground">Water ratio:</span> {sp.waterRatio}</div>}
              {sp.reductionTarget && <div><span className="text-muted-foreground">Target:</span> {sp.reductionTarget}</div>}
              {sp.completionTest && <div><span className="text-muted-foreground">Completion test:</span> {sp.completionTest}</div>}
              {sp.numberOfCycles != null && <div><span className="text-muted-foreground">Cycles required:</span> {sp.numberOfCycles}</div>}
              {sp.yieldQty != null && <div><span className="text-muted-foreground">Expected yield:</span> {sp.yieldQty} {sp.yieldUnit}</div>}
            </div>

            {sp.ingredients.length > 0 && (
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-2 py-1.5 text-left">Dravya</th>
                      <th className="px-2 py-1.5 text-left">Required</th>
                      <th className="px-2 py-1.5 text-left">Actual</th>
                      <th className="px-2 py-1.5 text-left">Unit</th>
                      <th className="px-2 py-1.5 text-left">Part</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sp.ingredients.map((ing, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1.5">
                          {ing.name}
                          {ing.nameHi && <span className="ml-1 text-muted-foreground" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>/ {ing.nameHi}</span>}
                        </td>
                        <td className="px-2 py-1.5">{ing.requiredQty}</td>
                        <td className="px-2 py-1.5">
                          <input type="number" className="form-input-sm w-20" value={ing.actualQty || ""}
                            onChange={(e) => {
                              const ings = sp.ingredients.map((x, ix) => ix === i ? { ...x, actualQty: Number(e.target.value) } : x);
                              updateSP(sp.id, { ingredients: ings });
                            }} />
                        </td>
                        <td className="px-2 py-1.5">{ing.unit}</td>
                        <td className="px-2 py-1.5">{ing.part}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sp.type === "Kwatha" && (
              <div className="grid grid-cols-4 gap-2">
                <div className="form-field"><label>Initial volume</label><input value={sp.initialVolume || ""} onChange={(e) => updateSP(sp.id, { initialVolume: e.target.value })} placeholder="e.g. 16 L" /></div>
                <div className="form-field"><label>Final volume</label><input value={sp.finalVolume || ""} onChange={(e) => updateSP(sp.id, { finalVolume: e.target.value })} placeholder="e.g. 4 L" /></div>
                <div className="form-field"><label>Paka duration</label><input value={sp.pakaDuration || ""} onChange={(e) => updateSP(sp.id, { pakaDuration: e.target.value })} placeholder="e.g. 3 hr" /></div>
                <div className="form-field"><label>Flame setting</label><input value={sp.flameSetting || ""} onChange={(e) => updateSP(sp.id, { flameSetting: e.target.value })} placeholder="Mandagni / Madhyamagni" /></div>
              </div>
            )}

            {(sp.type === "Bhavana" || sp.type === "Shodhana") && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium">Iteration log</span>
                  <button onClick={() => updateSP(sp.id, { iterationLog: [...(sp.iterationLog || []), { date: "", cycleNo: (sp.iterationLog?.length || 0) + 1, weightAfter: "", observedByPin: "" }] })}
                    className="px-2 py-0.5 rounded border border-border text-[10px] hover:bg-secondary flex items-center gap-1">
                    <Plus className="w-2.5 h-2.5" /> Add cycle
                  </button>
                </div>
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary text-[10px] uppercase">
                      <tr>
                        <th className="px-2 py-1.5 text-left w-20">Cycle #</th>
                        <th className="px-2 py-1.5 text-left">Date</th>
                        <th className="px-2 py-1.5 text-left">Weight after</th>
                        <th className="px-2 py-1.5 text-left">Observed by (PIN)</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sp.iterationLog || []).length === 0 && (
                        <tr><td colSpan={5} className="px-2 py-3 text-center text-[10px] text-muted-foreground italic">No cycles logged yet</td></tr>
                      )}
                      {(sp.iterationLog || []).map((log, li) => {
                        const updateLog = (patch: Partial<BMRSubProcessIterationLog>) => {
                          const next = (sp.iterationLog || []).map((l, i) => i === li ? { ...l, ...patch } : l);
                          updateSP(sp.id, { iterationLog: next });
                        };
                        return (
                          <tr key={li} className="border-t border-border">
                            <td className="px-2 py-1"><input type="number" className="form-input-sm w-14" value={log.cycleNo} onChange={(e) => updateLog({ cycleNo: Number(e.target.value) })} /></td>
                            <td className="px-2 py-1"><input type="date" className="form-input-sm" value={log.date} onChange={(e) => updateLog({ date: e.target.value })} /></td>
                            <td className="px-2 py-1"><input className="form-input-sm w-24" value={log.weightAfter} onChange={(e) => updateLog({ weightAfter: e.target.value })} placeholder="g" /></td>
                            <td className="px-2 py-1"><input className="form-input-sm w-20" value={log.observedByPin} onChange={(e) => updateLog({ observedByPin: e.target.value })} placeholder="PIN" /></td>
                            <td className="px-2 py-1">
                              <button onClick={() => updateSP(sp.id, { iterationLog: (sp.iterationLog || []).filter((_, i) => i !== li) })} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <div className="form-field">
                <label>Actual yield</label>
                <input value={sp.actualYield || ""} onChange={(e) => updateSP(sp.id, { actualYield: e.target.value })} placeholder="e.g. 3.8" />
              </div>
              <div className="form-field">
                <label>Yield unit</label>
                <select value={sp.actualYieldUnit || sp.yieldUnit || "L"} onChange={(e) => updateSP(sp.id, { actualYieldUnit: e.target.value })}>
                  <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                </select>
              </div>
              <div className="form-field">
                <label>Completion test result</label>
                <select value={sp.completionTestResult || ""} onChange={(e) => updateSP(sp.id, { completionTestResult: e.target.value as any })}>
                  <option value="">—</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date</label>
                <input type="date" value={sp.date || ""} onChange={(e) => updateSP(sp.id, { date: e.target.value })} />
              </div>
              <div className="form-field col-span-2">
                <label>Observed by</label>
                <input value={sp.observedBy || ""} onChange={(e) => updateSP(sp.id, { observedBy: e.target.value })} placeholder="Operator name / PIN" />
              </div>
              <div className="form-field col-span-2">
                <label>Notes</label>
                <input value={sp.batchNotes || ""} onChange={(e) => updateSP(sp.id, { batchNotes: e.target.value })} placeholder="Per-batch remarks" />
              </div>
            </div>

            {sp.actualYield && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                → Output: {sp.actualYield} {sp.actualYieldUnit} {sp.name} <span className="opacity-70">(available for next steps)</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStepRow = (s: BMRProcessStep, i: number) => (
    <div key={`step-${i}`} className="grid grid-cols-[28px_1.6fr_1fr_1fr_100px_100px] gap-2 py-1.5 items-center text-xs border-b border-border last:border-0">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColor(s.status)}`} />
      <div>
        <input className="form-input-sm w-full font-medium" value={s.step} onChange={e => updateStep(i, { step: e.target.value })} />
        {s.description !== undefined && (
          <input className="form-input-sm w-full mt-1 text-[10px]" value={s.description || ""} onChange={e => updateStep(i, { description: e.target.value })} placeholder="Details..." />
        )}
      </div>
      <div><input className="form-input-sm w-[90px]" value={s.startTime || ""} onChange={e => updateStep(i, { startTime: e.target.value })} placeholder="--:--" /></div>
      <div><input className="form-input-sm w-[90px]" value={s.endTime || ""} onChange={e => updateStep(i, { endTime: e.target.value })} placeholder="--:--" /></div>
      <div><input className="form-input-sm w-[90px]" value={s.operator || ""} onChange={e => updateStep(i, { operator: e.target.value })} placeholder="Name" /></div>
      <div>
        <select className={statusSelectClass(s.status)} value={s.status}
          onChange={e => updateStep(i, { status: e.target.value as BMRProcessStep["status"] })}>
          <option value="todo">Pending</option>
          <option value="current">In prog.</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.9 & 10: Date, time and duration of each process step with operator details. Sub-processes (Kwatha, Kalka, Bhavana, Shodhana) are inlined where they belong in the timeline.</span>
      </div>

      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Process timeline</div>
          <button onClick={addStep} className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add step
          </button>
        </div>
        <div className="p-3.5 overflow-x-auto">
          <div className="grid grid-cols-[28px_1.6fr_1fr_1fr_100px_100px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div></div><div>Step</div><div>Start</div><div>End</div><div>Operator</div><div>Status</div>
          </div>
          {timeline.map((item) =>
            item.type === "subprocess"
              ? renderSubProcess(item.data)
              : renderStepRow(item.data, item.idx)
          )}
        </div>
      </div>
    </>
  );
};

export default Step3ProcessLog;
