import { useNavigate } from "react-router-dom";

const ScheduleTA = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Schedule TA — Annual return</div>
          <div className="text-[11px] text-muted-foreground mt-px">Rule 157A · FY 2024-25 · Auto-compiled from GRN data</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Preview PDF</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Submit</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Facility info */}
        <div className="bg-secondary rounded-md p-3.5 mb-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Mfg. license no.</div>
            <div className="font-medium">MH-AY-2018-042</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Issued by</div>
            <div className="font-medium">FDA Maharashtra</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Facility</div>
            <div className="font-medium">Vaidya Pharma Pvt. Ltd., Pune</div>
          </div>
        </div>

        {/* Herbs table */}
        <div className="app-card mb-2.5">
          <div className="app-card-head">
            <div className="app-card-title">(a) Herbs used — 01 Apr 2024 to 31 Mar 2025</div>
            <span className="app-badge app-badge-teal">Auto-compiled</span>
          </div>
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Common name (AFI/API)</th><th>Botanical name</th><th>Qty used (kg/annum)</th><th>Traders</th><th>Manufacturers</th><th>Forest collectors</th><th>Cultivators</th><th>Imported</th><th>Total</th><th>Part used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Ashwagandha", bot: "Withania somnifera", qty: "48.2", traders: "48.2", mfg: "—", forest: "—", cult: "—", imp: "—", total: "48.2", part: "Root" },
                  { name: "Amalaki", bot: "Emblica officinalis", qty: "120.5", traders: "80.0", mfg: "—", forest: "—", cult: "40.5", imp: "—", total: "120.5", part: "Fruit rind" },
                  { name: "Haritaki", bot: "Terminalia chebula", qty: "85.0", traders: "85.0", mfg: "—", forest: "—", cult: "—", imp: "—", total: "85.0", part: "Fruit rind" },
                  { name: "Pippali", bot: "Piper longum", qty: "32.4", traders: "32.4", mfg: "—", forest: "—", cult: "—", imp: "—", total: "32.4", part: "Fruit" },
                  { name: "Dhataki Pushpa", bot: "Woodfordia fruticosa", qty: "18.0", traders: "—", mfg: "—", forest: "18.0", cult: "—", imp: "—", total: "18.0", part: "Flower" },
                ].map((r) => (
                  <tr key={r.name}>
                    <td className="font-medium">{r.name}</td>
                    <td className="italic text-[11px] text-muted-foreground">{r.bot}</td>
                    <td>{r.qty}</td>
                    <td>{r.traders}</td>
                    <td>{r.mfg}</td>
                    <td>{r.forest}</td>
                    <td>{r.cult}</td>
                    <td>{r.imp}</td>
                    <td>{r.total}</td>
                    <td>{r.part}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metals table */}
        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">(c) Metals / minerals used</div>
            <span className="app-badge app-badge-teal">Auto-compiled</span>
          </div>
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Common name</th><th>Chemical name</th><th>Qty used (kg/annum)</th><th>Manufacturers</th><th>Traders (domestic)</th><th>Importers</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Abhraka Bhasma</td>
                  <td className="text-[11px]">Mica / Biotite silicate</td>
                  <td>2.4</td><td>2.4</td><td>—</td><td>—</td><td>2.4</td>
                </tr>
                <tr>
                  <td className="font-medium">Godanti Bhasma</td>
                  <td className="text-[11px]">Calcium sulphate (Selenite)</td>
                  <td>1.2</td><td>—</td><td>1.2</td><td>—</td><td>1.2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleTA;
