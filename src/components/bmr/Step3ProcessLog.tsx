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

  const updateEnv = (key: string, value: string) =>
    onChange({ environment: { ...bmr.environment, [key]: value } });

  const updateBlend = (key: string, value: string) => {
    const bw = { ...bmr.blendWeight, [key]: value };
    if (key === "actualBlendWt" && bw.theoreticalBlendWt) {
      const t = parseFloat(bw.theoreticalBlendWt);
      const a = parseFloat(value);
      if (t && a) {
        bw.lossOnBlending = (t - a).toFixed(3);
        bw.yieldAtBlendStage = ((a / t) * 100).toFixed(1) + "%";
      }
    }
    onChange({ blendWeight: bw });
  };

  const statusColor = (s: string) => s === "done" ? "bg-primary" : s === "current" ? "bg-warning" : "bg-border";
  const statusSelectClass = (s: string) => s === "done" ? "form-input-sm !border-primary !bg-[hsl(var(--badge-green-bg))] !text-[hsl(var(--badge-green-text))] font-medium" : s === "current" ? "form-input-sm !border-[hsl(var(--warning))] !bg-[hsl(var(--badge-amber-bg))] !text-[hsl(var(--badge-amber-text))] font-medium" : "form-input-sm";

  const addStep = () => {
    onChange({
      steps: [...bmr.steps, { step: "", status: "todo" as const }],
    });
  };

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.9 & 10: Date, time and duration of mixing; environmental controls. §I-A.11-13: Granulation date, blend weight, IPC records.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Environmental conditions log</div>
          <span className="app-badge app-badge-purple">Continuous record</span>
        </div>
        <div className="p-3.5 grid grid-cols-4 gap-2.5">
          <div className="form-field">
            <label>Room temperature (°C)</label>
            <input type="number" step="0.1" value={bmr.environment.roomTemp} onChange={e => updateEnv("roomTemp", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Relative humidity (%)</label>
            <input type="number" step="1" value={bmr.environment.relativeHumidity} onChange={e => updateEnv("relativeHumidity", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Room pressure</label>
            <select value={bmr.environment.roomPressure} onChange={e => updateEnv("roomPressure", e.target.value)}>
              <option>Positive</option><option>Negative</option><option>Ambient</option>
            </select>
          </div>
          <div className="form-field">
            <label>HVAC / AC unit</label>
            <input value={bmr.environment.hvacUnit} onChange={e => updateEnv("hvacUnit", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Process steps log</div>
          <button onClick={addStep} className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add step
          </button>
        </div>
        <div className="p-3.5 overflow-x-auto">
          {/* Header */}
          <div className="grid grid-cols-[28px_1.6fr_1fr_1fr_80px_80px_80px_80px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
            <div></div><div>Step</div><div>Start</div><div>End</div><div>Temp °C</div><div>RH %</div><div>Operator</div><div>Status</div>
          </div>
          {bmr.steps.map((s, i) => (
            <div key={i} className="grid grid-cols-[28px_1.6fr_1fr_1fr_80px_80px_80px_80px] gap-2 py-1.5 items-center text-xs border-b border-border last:border-0">
              <div className={`w-2.5 h-2.5 rounded-full ${statusColor(s.status)}`} />
              <div>
                <input className="form-input-sm w-full font-medium" value={s.step} onChange={e => updateStep(i, { step: e.target.value })} />
                {s.description !== undefined && (
                  <input className="form-input-sm w-full mt-1 text-[10px]" value={s.description || ""} onChange={e => updateStep(i, { description: e.target.value })} placeholder="Details..." />
                )}
              </div>
              <div><input className="form-input-sm w-[70px]" value={s.startTime || ""} onChange={e => updateStep(i, { startTime: e.target.value })} placeholder="--:--" /></div>
              <div><input className="form-input-sm w-[70px]" value={s.endTime || ""} onChange={e => updateStep(i, { endTime: e.target.value })} placeholder="--:--" /></div>
              <div><input type="number" className="form-input-sm w-[58px]" value={s.temp || ""} step="0.1" onChange={e => updateStep(i, { temp: e.target.value })} placeholder="°C" /></div>
              <div><input type="number" className="form-input-sm w-[50px]" value={s.humidity || ""} step="1" onChange={e => updateStep(i, { humidity: e.target.value })} placeholder="%" /></div>
              <div><input className="form-input-sm w-[70px]" value={s.operator || ""} onChange={e => updateStep(i, { operator: e.target.value })} placeholder="Name" /></div>
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

      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Blend weight record</div>
          <span className="app-badge app-badge-gray">§I-A.12</span>
        </div>
        <div className="p-3.5 grid grid-cols-4 gap-2.5">
          <div className="form-field">
            <label>Theoretical blend wt. ({bmr.batchUnit})</label>
            <input value={bmr.blendWeight.theoreticalBlendWt} onChange={e => updateBlend("theoreticalBlendWt", e.target.value)} />
          </div>
          <div className="form-field">
            <label>Actual blend wt. ({bmr.batchUnit})</label>
            <input type="number" value={bmr.blendWeight.actualBlendWt} onChange={e => updateBlend("actualBlendWt", e.target.value)} placeholder="After blending" />
          </div>
          <div className="form-field">
            <label>Loss on blending ({bmr.batchUnit})</label>
            <input value={bmr.blendWeight.lossOnBlending} readOnly className="bg-secondary" />
          </div>
          <div className="form-field">
            <label>% yield at blend stage</label>
            <input value={bmr.blendWeight.yieldAtBlendStage} readOnly className="bg-secondary" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Step3ProcessLog;
