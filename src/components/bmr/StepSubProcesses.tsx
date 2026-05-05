import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Info } from "lucide-react";
import { BMRRecord, BMRSubProcess, BMRSubProcessIterationLog } from "@/context/BMRContext";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const StepSubProcesses = ({ bmr, onChange }: Props) => {
  const subProcesses = bmr.subProcesses || [];
  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(subProcesses.map((sp) => [sp.id, true]))
  );

  const updateSP = (idx: number, patch: Partial<BMRSubProcess>) => {
    const next = subProcesses.map((sp, i) => (i === idx ? { ...sp, ...patch } : sp));
    onChange({ subProcesses: next });
  };

  if (subProcesses.length === 0) {
    return (
      <div className="app-card">
        <div className="app-card-head"><div className="app-card-title">Sub-processes / Intermediate preparations</div></div>
        <div className="p-6 text-center text-xs text-muted-foreground italic">
          This formulation has no sub-processes defined in the MFR. Continue to ingredients.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Record per-batch actuals for each intermediate preparation. Yields recorded here can be referenced by name in the main process log.</span>
      </div>
      <div className="space-y-3">
        {subProcesses.map((sp, idx) => {
          const isOpen = openIds[sp.id] ?? true;
          const toggle = () => setOpenIds((p) => ({ ...p, [sp.id]: !isOpen }));
          return (
            <div key={sp.id} className="app-card !overflow-visible">
              <div className="app-card-head cursor-pointer" onClick={toggle}>
                <div className="flex items-center gap-2 flex-1">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">{sp.type}</span>
                  <div className="app-card-title">{sp.name || `Sub-process ${idx + 1}`}</div>
                  {sp.actualYield && <span className="text-[10px] text-muted-foreground">· yield {sp.actualYield} {sp.actualYieldUnit}</span>}
                </div>
              </div>
              {isOpen && (
                <div className="p-3.5 space-y-3">
                  {sp.description && (
                    <div className="text-[11px] text-muted-foreground bg-secondary p-2 rounded">{sp.description}</div>
                  )}

                  {/* Template (readonly) */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {sp.waterRatio && <div><span className="text-muted-foreground">Water ratio:</span> {sp.waterRatio}</div>}
                    {sp.reductionTarget && <div><span className="text-muted-foreground">Target:</span> {sp.reductionTarget}</div>}
                    {sp.completionTest && <div><span className="text-muted-foreground">Completion test:</span> {sp.completionTest}</div>}
                    {sp.numberOfCycles != null && <div><span className="text-muted-foreground">Cycles required:</span> {sp.numberOfCycles}</div>}
                    {sp.yieldQty != null && <div><span className="text-muted-foreground">Expected yield:</span> {sp.yieldQty} {sp.yieldUnit}</div>}
                  </div>

                  {/* Ingredients */}
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
                                    updateSP(idx, { ingredients: ings });
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

                  {/* Kwatha specific */}
                  {sp.type === "Kwatha" && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="form-field"><label>Initial volume</label><input value={sp.initialVolume || ""} onChange={(e) => updateSP(idx, { initialVolume: e.target.value })} placeholder="e.g. 16 L" /></div>
                      <div className="form-field"><label>Final volume</label><input value={sp.finalVolume || ""} onChange={(e) => updateSP(idx, { finalVolume: e.target.value })} placeholder="e.g. 4 L" /></div>
                      <div className="form-field"><label>Paka duration</label><input value={sp.pakaDuration || ""} onChange={(e) => updateSP(idx, { pakaDuration: e.target.value })} placeholder="e.g. 3 hr" /></div>
                      <div className="form-field"><label>Flame setting</label><input value={sp.flameSetting || ""} onChange={(e) => updateSP(idx, { flameSetting: e.target.value })} placeholder="Mandagni / Madhyamagni" /></div>
                    </div>
                  )}

                  {/* Bhavana / Shodhana iteration log */}
                  {(sp.type === "Bhavana" || sp.type === "Shodhana") && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium">Iteration log</span>
                        <button onClick={() => updateSP(idx, { iterationLog: [...(sp.iterationLog || []), { date: "", cycleNo: (sp.iterationLog?.length || 0) + 1, weightAfter: "", observedByPin: "" }] })}
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
                                updateSP(idx, { iterationLog: next });
                              };
                              return (
                                <tr key={li} className="border-t border-border">
                                  <td className="px-2 py-1"><input type="number" className="form-input-sm w-14" value={log.cycleNo} onChange={(e) => updateLog({ cycleNo: Number(e.target.value) })} /></td>
                                  <td className="px-2 py-1"><input type="date" className="form-input-sm" value={log.date} onChange={(e) => updateLog({ date: e.target.value })} /></td>
                                  <td className="px-2 py-1"><input className="form-input-sm w-24" value={log.weightAfter} onChange={(e) => updateLog({ weightAfter: e.target.value })} placeholder="g" /></td>
                                  <td className="px-2 py-1"><input className="form-input-sm w-20" value={log.observedByPin} onChange={(e) => updateLog({ observedByPin: e.target.value })} placeholder="PIN" /></td>
                                  <td className="px-2 py-1">
                                    <button onClick={() => updateSP(idx, { iterationLog: (sp.iterationLog || []).filter((_, i) => i !== li) })} className="text-muted-foreground hover:text-destructive">
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

                  {/* Per-batch actuals */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="form-field">
                      <label>Actual yield</label>
                      <input value={sp.actualYield || ""} onChange={(e) => updateSP(idx, { actualYield: e.target.value })} placeholder="e.g. 3.8" />
                    </div>
                    <div className="form-field">
                      <label>Yield unit</label>
                      <select value={sp.actualYieldUnit || sp.yieldUnit || "L"} onChange={(e) => updateSP(idx, { actualYieldUnit: e.target.value })}>
                        <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Completion test result</label>
                      <select value={sp.completionTestResult || ""} onChange={(e) => updateSP(idx, { completionTestResult: e.target.value as any })}>
                        <option value="">—</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Date</label>
                      <input type="date" value={sp.date || ""} onChange={(e) => updateSP(idx, { date: e.target.value })} />
                    </div>
                    <div className="form-field col-span-2">
                      <label>Observed by</label>
                      <input value={sp.observedBy || ""} onChange={(e) => updateSP(idx, { observedBy: e.target.value })} placeholder="Operator name / PIN" />
                    </div>
                    <div className="form-field col-span-2">
                      <label>Notes</label>
                      <input value={sp.batchNotes || ""} onChange={(e) => updateSP(idx, { batchNotes: e.target.value })} placeholder="Per-batch remarks" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default StepSubProcesses;
