import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, Search } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Dashboard</div>
          <div className="text-[11px] text-muted-foreground mt-px">Today: 14 Jun 2025 · FY 2025-26</div>
        </div>
        <button onClick={() => navigate("/rm-inward")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">+ New GRN</button>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">+ New BMR</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Alerts */}
        <div className="alert-strip alert-strip-red">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          3 items critically below reorder level — Ashwagandha root, Pippali fruit, Guggulu resin
        </div>
        <div className="alert-strip alert-strip-amber">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          2 batches expiring in 30 days — AR/2024-312 (Haritaki), AR/2024-298 (Dhataki Pushpa)
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2.5 mb-4 mt-2">
          <div className="kpi-card">
            <div className="kpi-label">Total RM items</div>
            <div className="kpi-value">48</div>
            <div className="kpi-sub">4 categories</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Below reorder</div>
            <div className="kpi-value text-kpi-danger">3</div>
            <div className="kpi-sub">Action needed</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Expiring ≤30d</div>
            <div className="kpi-value text-kpi-warning">2</div>
            <div className="kpi-sub">Review required</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Stock value</div>
            <div className="kpi-value text-kpi-ok">₹4.2L</div>
            <div className="kpi-sub">At latest rate</div>
          </div>
        </div>

        {/* Stock overview table */}
        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">RM stock overview</div>
            <div className="flex gap-1.5 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input type="search" placeholder="Search RM…" className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40" />
              </div>
              <button className="px-2.5 py-1 rounded-md border border-border text-[11px] font-medium hover:bg-secondary transition-all">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>RM name</th><th>Category</th><th>Stock qty</th><th>UOM</th><th>Reorder</th><th>Qty needed</th><th>Unit rate (₹)</th><th>Stock value (₹)</th><th>Nearest expiry</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="cursor-pointer" onClick={() => navigate("/stock-ledger")}>
                  <td>
                    <div className="font-medium">Ashwagandha</div>
                    <div className="text-[10px] text-muted-foreground">Withania somnifera · Root</div>
                  </td>
                  <td><span className="app-badge app-badge-green">Herb</span></td>
                  <td className="text-kpi-danger font-medium">1.2</td>
                  <td>kg</td>
                  <td>5.0</td>
                  <td className="text-kpi-danger">3.8 kg</td>
                  <td>480</td>
                  <td>576</td>
                  <td>Mar 2026</td>
                  <td><span className="app-badge app-badge-red">Critical</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Amla / Amalaki</div>
                    <div className="text-[10px] text-muted-foreground">Emblica officinalis · Fruit rind</div>
                  </td>
                  <td><span className="app-badge app-badge-green">Herb</span></td>
                  <td>18.5</td>
                  <td>kg</td>
                  <td>10.0</td>
                  <td>—</td>
                  <td>220</td>
                  <td>4,070</td>
                  <td>Dec 2025</td>
                  <td><span className="app-badge app-badge-teal">OK</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Pippali</div>
                    <div className="text-[10px] text-muted-foreground">Piper longum · Fruit</div>
                  </td>
                  <td><span className="app-badge app-badge-green">Herb</span></td>
                  <td className="text-kpi-warning font-medium">2.4</td>
                  <td>kg</td>
                  <td>4.0</td>
                  <td className="text-kpi-warning">1.6 kg</td>
                  <td>1,200</td>
                  <td>2,880</td>
                  <td>Feb 2026</td>
                  <td><span className="app-badge app-badge-amber">Low</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Shuddha Guggulu</div>
                    <div className="text-[10px] text-muted-foreground">Commiphora wightii · Resin</div>
                  </td>
                  <td><span className="app-badge app-badge-blue">Extract</span></td>
                  <td className="text-kpi-danger font-medium">0.5</td>
                  <td>kg</td>
                  <td>3.0</td>
                  <td className="text-kpi-danger">2.5 kg</td>
                  <td>3,400</td>
                  <td>1,700</td>
                  <td>Jun 2026</td>
                  <td><span className="app-badge app-badge-red">Critical</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Haritaki</div>
                    <div className="text-[10px] text-muted-foreground">Terminalia chebula · Fruit rind</div>
                  </td>
                  <td><span className="app-badge app-badge-green">Herb</span></td>
                  <td>9.0</td>
                  <td>kg</td>
                  <td>8.0</td>
                  <td>—</td>
                  <td>380</td>
                  <td>3,420</td>
                  <td className="text-kpi-warning font-medium">14 Jun 2025</td>
                  <td><span className="app-badge app-badge-amber">Expiring</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Abhraka (purified)</div>
                    <div className="text-[10px] text-muted-foreground">Mica · Shodhita</div>
                  </td>
                  <td><span className="app-badge app-badge-purple">Mineral</span></td>
                  <td>0.8</td>
                  <td>kg</td>
                  <td>0.5</td>
                  <td>—</td>
                  <td>12,000</td>
                  <td>9,600</td>
                  <td>Indefinite</td>
                  <td><span className="app-badge app-badge-teal">OK</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="font-medium">Cow ghee</div>
                    <div className="text-[10px] text-muted-foreground">Clarified butter</div>
                  </td>
                  <td><span className="app-badge app-badge-gray">Animal</span></td>
                  <td>6.2</td>
                  <td>L</td>
                  <td>5.0</td>
                  <td>—</td>
                  <td>640</td>
                  <td>3,968</td>
                  <td>Sep 2025</td>
                  <td><span className="app-badge app-badge-teal">OK</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
