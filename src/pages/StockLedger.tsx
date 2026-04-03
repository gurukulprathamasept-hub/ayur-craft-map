import { useState } from "react";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useStock, type RMEntry } from "@/context/StockContext";

const catBadge: Record<string, string> = {
  Herb: "app-badge-green",
  Extract: "app-badge-blue",
  "Metal/Mineral": "app-badge-purple",
  Animal: "app-badge-gray",
};

function computeKpis(rm: RMEntry) {
  const opening = rm.txns.find((t) => t.type === "Opening");
  const openingQty = opening ? parseFloat(opening.qtyIn) : 0;
  const totalIn = rm.txns.filter((t) => t.type === "Inward").reduce((s, t) => s + parseFloat(t.qtyIn), 0);
  const totalOut = rm.txns.filter((t) => t.type === "Outward").reduce((s, t) => s + parseFloat(t.qtyOut), 0);
  const grnCount = rm.txns.filter((t) => t.type === "Inward").length;
  const issCount = rm.txns.filter((t) => t.type === "Outward").length;
  return { openingQty, totalIn, totalOut, grnCount, issCount, closing: rm.currentStock };
}

const StockLedger = () => {
  const { rmData } = useStock();
  const [selectedRM, setSelectedRM] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const activeRM = rmData.find((r) => r.code === selectedRM);

  // List view
  if (!activeRM) {
    const searchedRMs = rmData.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <>
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
          <div className="flex-1">
            <div className="text-[15px] font-medium">Stock ledger</div>
            <div className="text-[11px] text-muted-foreground mt-px">{rmData.length} raw materials tracked</div>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search RM…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-44"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="app-card">
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>RM code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Current stock</th>
                    <th>Reorder</th>
                    <th>Status</th>
                    <th>Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedRMs.map((rm) => {
                    const belowReorder = rm.currentStock < rm.reorder;
                    return (
                      <tr
                        key={rm.code}
                        className="cursor-pointer"
                        onClick={() => setSelectedRM(rm.code)}
                      >
                        <td className="font-mono text-[11px]">{rm.code}</td>
                        <td>
                          <div className="font-medium text-xs">{rm.name}</div>
                          <div className="text-[10px] text-muted-foreground italic">{rm.botanical}</div>
                        </td>
                        <td>
                          <span className={`app-badge ${catBadge[rm.category] || "app-badge-gray"}`}>{rm.category}</span>
                        </td>
                        <td className={belowReorder ? "text-destructive font-medium" : ""}>
                          {rm.currentStock} {rm.uom}
                        </td>
                        <td>{rm.reorder} {rm.uom}</td>
                        <td>
                          {belowReorder ? (
                            <span className="app-badge app-badge-red">Below reorder</span>
                          ) : (
                            <span className="app-badge app-badge-teal">OK</span>
                          )}
                        </td>
                        <td className="text-muted-foreground">{rm.txns.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Detail view
  const kpis = computeKpis(activeRM);
  const filtered = filter === "All" ? activeRM.txns : activeRM.txns.filter((t) => t.type === filter);
  const belowReorder = activeRM.currentStock < activeRM.reorder;

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Stock ledger — {activeRM.name}</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {activeRM.code} · {activeRM.botanical} · Current stock: {activeRM.currentStock} {activeRM.uom}
          </div>
        </div>
        <button
          onClick={() => { setSelectedRM(null); setFilter("All"); }}
          className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-4 gap-2.5 mb-4">
          <div className="kpi-card">
            <div className="kpi-label">Opening stock</div>
            <div className="kpi-value">{kpis.openingQty} {activeRM.uom}</div>
            <div className="kpi-sub">01 Apr 2025</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total received</div>
            <div className="kpi-value text-ledger-in">{kpis.totalIn.toFixed(1)} {activeRM.uom}</div>
            <div className="kpi-sub">{kpis.grnCount} GRN{kpis.grnCount !== 1 ? "s" : ""}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total issued</div>
            <div className="kpi-value text-ledger-out">{kpis.totalOut.toFixed(1)} {activeRM.uom}</div>
            <div className="kpi-sub">{kpis.issCount} issue{kpis.issCount !== 1 ? "s" : ""}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Closing stock</div>
            <div className={`kpi-value ${belowReorder ? "text-kpi-danger" : ""}`}>{kpis.closing} {activeRM.uom}</div>
            {belowReorder && <div className="kpi-sub">Below reorder ({activeRM.reorder} {activeRM.uom})</div>}
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
                  <th>Date</th><th>Type</th><th>Reference</th><th>Batch / AR no.</th><th>Expiry</th><th>Qty in</th><th>Qty out</th><th>Balance</th><th>Rate (₹/{activeRM.uom})</th>
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
