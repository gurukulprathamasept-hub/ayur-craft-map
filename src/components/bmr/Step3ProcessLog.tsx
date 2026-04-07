import { BMRRecord, BMRProcessStep } from "@/context/BMRContext";
import { Info, Plus } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const Step3ProcessLog = ({ bmr, onChange }: Props) => {
  const updateStep = (idx: number, updates: Partial<BMRProcessStep>) => {
    const steps = bmr.steps.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onChange({ steps });
  };

  const statusColor = (s: string) => s === "done" ? "bg-primary" : s === "current" ? "bg-warning" : "bg-border";
  const statusSelectClass = (s: string) => s === "done" ? "form-input-sm !border-primary !bg-[hsl(var(--badge-green-bg))] !text-[hsl(var(--badge-green-text))] font-medium" : s === "current" ? "form-input-sm !border-[hsl(var(--warning))] !bg-[hsl(var(--badge-amber-bg))] !text-[hsl(var(--badge-amber-text))] font-medium" : "form-input-sm";

  const addStep = () => {
    onChange({
      steps: [...bmr.steps, { step: "", status: "todo" as const }],
    });
  };

  const updatePersonnel = (key: string, value: string) =>
    onChange({ personnel: { ...bmr.personnel, [key]: value } });

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.9 & 10: Date, time and duration of each process step with operator details.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Room & equipment details</div>
        </div>
        <div className="p-3.5 grid grid-cols-2 gap-2.5">
          <div className="form-field">
            <label>Room / plant no.</label>
            <input value={bmr.personnel.roomPlant} onChange={e => updatePersonnel("roomPlant", e.target.value)} placeholder="e.g. Room 201-A" />
          </div>
          <div className="form-field">
            <label>Equipment used</label>
            <input value={bmr.personnel.equipmentUsed} onChange={e => updatePersonnel("equipmentUsed", e.target.value)} placeholder="e.g. Multi-mill, Blender" />
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Process steps log</div>
          <button onClick={addStep} className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add step
          </button>
        </div>
        <div className="p-3.5 overflow-x-auto">
          <div className="grid grid-cols-[28px_1.6fr_1fr_1fr_100px_100px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div></div><div>Step</div><div>Start</div><div>End</div><div>Operator</div><div>Status</div>
          </div>
          {bmr.steps.map((s, i) => (
            <div key={i} className="grid grid-cols-[28px_1.6fr_1fr_1fr_100px_100px] gap-2 py-1.5 items-center text-xs border-b border-border last:border-0">
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
          ))}
        </div>
      </div>
    </>
  );
};

export default Step3ProcessLog;
