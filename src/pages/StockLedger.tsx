import { useNavigate } from "react-router-dom";
import { useState } from "react";

const txns = [
  { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "6.200", qtyOut: "—", balance: "6.200", rate: "—" },
  { date: "05 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0102", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "8.000", qtyOut: "—", balance: "14.200", rate: "440" },
  { date: "08 Apr 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0058", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "4.800", balance: "9.400", rate: "440" },
  { date: "22 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0071", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "3.200", balance: "6.200", rate: "440" },
  { date: "10 Jun 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0178", batch: "AR/2025-178", expiry: "Jun 2027", qtyIn: "7.000", qtyOut: "—", balance: "13.200", rate: "450" },
  { date: "12 Jun 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0088", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "12.000", balance: "1.200", rate: "440" },
];

const StockLedger = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? txns : txns.filter((t) => t.type === filter);

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Stock ledger — Ashwagandha</div>
          <div className="text-[11px] text-muted-foreground mt-px">RM-001 · Withania somnifera · Current stock: 1.2 kg</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Export CSV</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          <div className="kpi-card">
            <div className="kpi-label">Opening stock</div>
            <div className="kpi-value">6.2 kg</div>
            <div className="kpi-sub">01 Apr 2025</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total received</div>
            <div className="kpi-value text-ledger-in">15.0 kg</div>
            <div className="kpi-sub">3 GRNs</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total issued</div>
            <div className="kpi-value text-ledger-out">20.0 kg</div>
            <div className="kpi-sub">5 issues</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Closing stock</div>
            <div className="kpi-value text-kpi-danger">1.2 kg</div>
            <div className="kpi-sub">Below reorder (5 kg)</div>
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">Transaction history</div>
            <div className="flex gap-1.5">
              {["All", "Inward", "Outward"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-chip ${filter === f ? "filter-chip-active" : ""}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Reference</th><th>Batch / AR no.</th><th>Expiry</th><th>Qty in</th><th>Qty out</th><th>Balance</th><th>Rate (₹/kg)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td><span className={`app-badge app-badge-${t.typeBadge}`}>{t.type}</span></td>
                    <td>{t.ref}</td>
                    <td>{t.batch}</td>
                    <td>{t.expiry}</td>
                    <td className={t.qtyIn !== "—" ? "text-ledger-in font-medium" : ""}>{t.qtyIn}</td>
                    <td className={t.qtyOut !== "—" ? "text-ledger-out font-medium" : ""}>{t.qtyOut}</td>
                    <td>{t.balance}</td>
                    <td>{t.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockLedger;
