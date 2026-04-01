import { useNavigate } from "react-router-dom";

const BMR = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">BMR — Batch Manufacturing Record</div>
          <div className="text-[11px] text-muted-foreground mt-px">BMR-2025-0041 · Triphala Churna · In process</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Send to QC</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-4">
          {[
            { n: 1, label: "Batch header", status: "done" },
            { n: 2, label: "Ingredients", status: "done" },
            { n: 3, label: "Process log", status: "current" },
            { n: 4, label: "IPC checks", status: "todo" },
            { n: 5, label: "QC release", status: "todo" },
          ].map((step, i) => (
            <div key={i} className="contents">
              {i > 0 && <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />}
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className={`step-num step-num-${step.status}`}>{step.n}</div>
                <span className={step.status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Batch header card */}
        <div className="app-card mb-2.5">
          <div className="app-card-head">
            <div className="app-card-title">Batch header</div>
            <span className="app-badge app-badge-blue">In process</span>
          </div>
          <div className="p-3.5 grid grid-cols-4 gap-2.5 text-xs">
            {[
              ["Product", "Triphala Churna"],
              ["Batch no.", "BMR-2025-0041"],
              ["Batch size", "10 kg"],
              ["MFR reference", "AFI Vol.I / TC-001"],
              ["Start date", "14 Jun 2025"],
              ["Expiry date", "13 Jun 2027"],
              ["Theoretical yield", "9.8 kg"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
                <div className="font-medium">{value}</div>
              </div>
            ))}
            <div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Actual yield</div>
              <input type="number" className="w-20 px-2 py-1 border border-border rounded-md text-[11px]" placeholder="kg" />
            </div>
          </div>
          <div className="px-3.5 pb-2.5">
            <div className="text-[10px] text-muted-foreground mb-1">Yield progress</div>
            <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: "0%" }} /></div>
          </div>
        </div>

        {/* Ingredient consumption */}
        <div className="app-card mb-2.5">
          <div className="app-card-head"><div className="app-card-title">Ingredient consumption — actual vs required</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>RM (AR no.)</div><div>Reqd. qty</div><div>Actual used</div><div>Lot used</div><div>Cost (₹)</div><div>Flag</div>
            </div>
            {[
              { name: "Amla / Amalaki", ar: "AR/2025-162", req: "3.333 kg", actual: 3.333, lot: "AR/2025-162", lotColor: "teal", cost: "733", flag: "OK", flagColor: "green" },
              { name: "Haritaki", ar: "AR/2024-312", req: "3.333 kg", actual: 3.340, lot: "AR/2024-312", lotColor: "amber", cost: "1,269", flag: "+0.2%", flagColor: "amber" },
              { name: "Vibhitaki", ar: "AR/2025-171", req: "3.334 kg", actual: 3.334, lot: "AR/2025-171", lotColor: "teal", cost: "887", flag: "OK", flagColor: "green" },
            ].map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 py-1.5 items-center text-xs ${i < 2 ? "border-b border-border" : ""}`}>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.ar}</div>
                </div>
                <div>{item.req}</div>
                <div><input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={item.actual} /></div>
                <div><span className={`app-badge app-badge-${item.lotColor} text-[10px]`}>{item.lot}</span></div>
                <div>{item.cost}</div>
                <div><span className={`app-badge app-badge-${item.flagColor}`}>{item.flag}</span></div>
              </div>
            ))}
            <div className="flex justify-end gap-4 pt-2 border-t border-border mt-1">
              <span className="text-[11px] text-muted-foreground">Total RM cost</span>
              <span className="text-[13px] font-medium">₹ 2,889</span>
            </div>
          </div>
        </div>

        {/* Process log */}
        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Process log — step 3 of 5</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="form-field">
                <label>Process step</label>
                <select>
                  <option>Grinding (pulverising)</option>
                  <option>Sieving (80 mesh)</option>
                  <option>Blending</option>
                </select>
              </div>
              <div className="form-field"><label>Step start</label><input type="datetime-local" defaultValue="2025-06-14T10:30" /></div>
              <div className="form-field"><label>Step end</label><input type="datetime-local" defaultValue="2025-06-14T12:00" /></div>
              <div className="form-field"><label>Room temp (°C)</label><input type="number" defaultValue={26} placeholder="°C" /></div>
              <div className="form-field"><label>Relative humidity (%)</label><input type="number" defaultValue={52} placeholder="%" /></div>
              <div className="form-field"><label>Operator</label><input defaultValue="Suresh Patil" /></div>
            </div>
            <div className="form-field">
              <label>Remarks</label>
              <textarea defaultValue="All three fruits ground separately, sieved at 80 mesh. Blend uniform — visual check passed." />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BMR;
