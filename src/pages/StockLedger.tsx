import { useState } from "react";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useStock, type RMEntry } from "@/context/StockContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const { rmData, lots } = useStock();
  const { displayName } = useLanguage();
  const [selectedRM, setSelectedRM] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"txns" | "lots">("txns");

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
                          <div className="font-medium text-xs">{displayName(rm.name, rm.nameHi)}</div>
                          <div className="text-[10px] text-muted-foreground italic">
                            {rm.nameHi && rm.nameHi !== displayName(rm.name, rm.nameHi) ? `${rm.nameHi} · ` : ""}{rm.botanical}
                          </div>
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
          <div className="text-[15px] font-medium">Stock ledger — {displayName(activeRM.name, activeRM.nameHi)}</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {activeRM.code} · {activeRM.nameHi ? `${activeRM.nameHi} · ` : ""}{activeRM.botanical} · Current stock: {activeRM.currentStock} {activeRM.uom}
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
            <div className="app-card-title">{view === "txns" ? "Transaction history" : "Stock lots (FIFO order)"}</div>
            <div className="flex gap-1.5">
              <button onClick={() => setView("txns")} className={`filter-chip ${view === "txns" ? "filter-chip-active" : ""}`}>Transactions</button>
              <button onClick={() => setView("lots")} className={`filter-chip ${view === "lots" ? "filter-chip-active" : ""}`}>Lots</button>
              {view === "txns" && ["All", "Inward", "Outward"].map((f) => (
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
            {view === "txns" ? (
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
            ) : (
              (() => {
                const rmLots = lots
                  .filter(l => l.rmCode === activeRM.code)
                  .sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
                if (rmLots.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No lots tracked yet for this RM. Lots are created when a GRN is finalised after QC approval.
                    </div>
                  );
                }
                const totalRemaining = rmLots.reduce((s, l) => s + l.qtyRemaining, 0);
                return (
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Batch no.</th><th>GRN ref</th><th>Received</th><th>Expiry</th>
                        <th className="text-right">Qty received</th><th className="text-right">Qty remaining</th>
                        <th className="text-right">Consumed</th><th>Status</th><th>Rate (₹/{activeRM.uom})</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rmLots.map(l => {
                        const consumed = parseFloat((l.qtyReceived - l.qtyRemaining).toFixed(3));
                        const recDate = new Date(l.receivedDate);
                        const recStr = isNaN(recDate.getTime()) ? l.receivedDate :
                          `${String(recDate.getDate()).padStart(2, "0")} ${recDate.toLocaleString("en", { month: "short" })} ${recDate.getFullYear()}`;
                        const badge = l.status === "active" ? "app-badge-teal" : l.status === "exhausted" ? "app-badge-gray" : "app-badge-red";
                        return (
                          <tr key={l.lotId}>
                            <td className="font-mono text-[11px] font-medium text-primary">{l.batchNo}</td>
                            <td className="text-[11px]">{l.grnRef}</td>
                            <td>{recStr}</td>
                            <td>{l.expiry || "—"}</td>
                            <td className="text-right">{l.qtyReceived.toFixed(3)} {activeRM.uom}</td>
                            <td className={`text-right font-medium ${l.qtyRemaining > 0 ? "text-ledger-in" : "text-muted-foreground"}`}>
                              {l.qtyRemaining.toFixed(3)} {activeRM.uom}
                            </td>
                            <td className="text-right text-ledger-out">{consumed.toFixed(3)} {activeRM.uom}</td>
                            <td><span className={`app-badge ${badge}`}>{l.status}</span></td>
                            <td>{l.rate || "—"}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-secondary/40 font-medium">
                        <td colSpan={5} className="text-right text-xs text-muted-foreground">Total active stock across lots</td>
                        <td className="text-right text-ledger-in">{totalRemaining.toFixed(3)} {activeRM.uom}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tbody>
                  </table>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockLedger;
