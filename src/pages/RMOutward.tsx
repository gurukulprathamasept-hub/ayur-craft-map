import { useNavigate } from "react-router-dom";

const RMOutward = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM issue to production</div>
          <div className="text-[11px] text-muted-foreground mt-px">ISS-2025-0094 · Against BMR-2025-0041 · Triphala Churna</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Confirm issue</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-2.5">
          <div className="form-field"><label>Issue slip no.</label><input value="ISS-2025-0094" disabled className="bg-secondary" /></div>
          <div className="form-field"><label>BMR reference</label><input value="BMR-2025-0041 · Triphala Churna" disabled className="bg-secondary" /></div>
          <div className="form-field"><label>Issue date</label><input type="date" defaultValue="2025-06-14" /></div>
          <div className="form-field"><label>Requested by</label><input defaultValue="Suresh Patil (Production)" /></div>
          <div className="form-field"><label>Approved by</label><input defaultValue="Dr. A. Kulkarni (Tech. Staff)" /></div>
          <div className="form-field"><label>Issued by</label><input defaultValue="Ramesh Nair (Store)" /></div>
        </div>

        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Ingredients to issue — FIFO batch auto-selected</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>RM</div><div>Required (BMR)</div><div>FIFO batch</div><div>Expiry</div><div>Qty to issue</div><div>Variance</div>
            </div>

            {[
              { name: "Amla / Amalaki", bot: "Emblica officinalis", req: "3.333 kg", batch: "AR/2025-162", batchColor: "teal", expiry: "Dec 2025", qty: 3.333, variance: "0.000", vClass: "text-kpi-ok" },
              { name: "Haritaki", bot: "Terminalia chebula", req: "3.333 kg", batch: "AR/2024-312", batchColor: "amber", expiry: "14 Jun 2025", expiryWarn: true, qty: 3.333, variance: "0.000", vClass: "text-kpi-ok" },
              { name: "Vibhitaki", bot: "Terminalia bellirica", req: "3.334 kg", batch: "AR/2025-171", batchColor: "teal", expiry: "Feb 2026", qty: 3.334, variance: "0.000", vClass: "text-kpi-ok" },
            ].map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 py-2 items-center text-xs ${i < 2 ? "border-b border-border" : ""}`}>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.bot}</div>
                </div>
                <div>{item.req}</div>
                <div><span className={`app-badge app-badge-${item.batchColor}`}>{item.batch}</span></div>
                <div className={item.expiryWarn ? "text-kpi-warning font-medium" : ""}>{item.expiry}</div>
                <div><input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={item.qty} /></div>
                <div className={`${item.vClass} font-medium`}>{item.variance}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="alert-strip alert-strip-amber mt-1.5">
          Warning: Haritaki batch AR/2024-312 expires today. Confirm use with QC before issuing.
        </div>
      </div>
    </>
  );
};

export default RMOutward;
