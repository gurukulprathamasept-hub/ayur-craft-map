import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Search, ChevronDown, ChevronUp, FileText, ClipboardCheck, Activity, Calendar } from "lucide-react";
import { useStock } from "@/context/StockContext";
import { useBMRs } from "@/context/BMRContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusKey = "Critical" | "Low" | "Expiring" | "OK";

const FY_OPTIONS = ["FY 2024-25", "FY 2025-26", "FY 2026-27"];

const monthMap: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseExpiry(exp: string): Date | null {
  if (!exp || exp === "—" || /indef/i.test(exp)) return null;
  // Formats: "Mar 2026", "14 Jun 2025", "Aug 2026"
  const dmY = exp.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/);
  if (dmY) return new Date(parseInt(dmY[3]), monthMap[dmY[2]] ?? 0, parseInt(dmY[1]));
  const mY = exp.match(/^(\w{3})\s+(\d{4})$/);
  if (mY) return new Date(parseInt(mY[2]), monthMap[mY[1]] ?? 0, 1);
  const d = new Date(exp);
  return isNaN(d.getTime()) ? null : d;
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { rmData, pendingGRNs, issuedRecords } = useStock();
  const { bmrs } = useBMRs();

  const [fy, setFy] = useState("FY 2025-26");
  const [redOpen, setRedOpen] = useState(false);
  const [amberOpen, setAmberOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Derived rows
  const rows = useMemo(() => {
    return rmData.map((rm) => {
      // Build batch list from inward txns minus consumed
      const batches = rm.txns
        .filter((t) => t.type === "Inward" && t.expiry && t.expiry !== "—")
        .map((t) => ({
          batch: t.batch,
          expiry: t.expiry,
          qty: parseFloat(t.qtyIn) || 0,
          rate: t.rate,
        }));

      // Compute nearest expiry
      const withDates = batches
        .map((b) => ({ ...b, date: parseExpiry(b.expiry) }))
        .filter((b) => b.date) as Array<{ batch: string; expiry: string; qty: number; rate: string; date: Date }>;
      withDates.sort((a, b) => a.date.getTime() - b.date.getTime());
      const nearest = withDates[0];

      // Status
      let status: StatusKey = "OK";
      const ratio = rm.reorder > 0 ? rm.currentStock / rm.reorder : 1;
      if (rm.currentStock < rm.reorder * 0.5) status = "Critical";
      else if (rm.currentStock < rm.reorder) status = "Low";
      if (nearest) {
        const days = (nearest.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (days <= 30 && status === "OK") status = "Expiring";
      }

      const lastRate = [...rm.txns].reverse().find((t) => t.rate && t.rate !== "—")?.rate || "0";
      const rate = parseFloat(lastRate) || 0;
      const value = rate * rm.currentStock;
      const needed = rm.currentStock < rm.reorder ? +(rm.reorder - rm.currentStock).toFixed(2) : 0;

      return {
        rm,
        status,
        rate,
        value,
        needed,
        nearest,
        batches: withDates,
      };
    });
  }, [rmData]);

  const criticalRows = rows.filter((r) => r.status === "Critical");
  const expiringRows = rows.filter((r) => r.status === "Expiring");
  const lowRows = rows.filter((r) => r.status === "Low");
  const totalValue = rows.reduce((s, r) => s + r.value, 0);

  const activeBmrs = bmrs.filter((b) => b.status === "In process" || b.status === "QC pending");
  const pendingGrnCount = pendingGRNs.filter((g) => g.status === "pending_qc" || g.status === "partial").length;

  // Recent activity
  const activity = useMemo(() => {
    const items: { ts: Date; label: string; user: string; href?: string }[] = [];
    bmrs.forEach((b) => {
      const d = new Date(b.createdAt);
      items.push({
        ts: d,
        label: `BMR ${b.batchNo || "(draft)"} for ${b.productName || "—"} ${b.status === "Released" ? "released" : "created"}`,
        user: b.personnel?.preparedBy || "System",
        href: `/bmr/${b.id}`,
      });
    });
    pendingGRNs.forEach((g) => {
      items.push({
        ts: new Date(),
        label: `${g.grnNo} submitted for QC (${g.supplier})`,
        user: "Stores",
        href: "/rm-inward",
      });
    });
    issuedRecords.forEach((i) => {
      items.push({
        ts: new Date(),
        label: `${i.issRef} ${i.status === "reversed" ? "reversed" : "issued"} — ${i.source}`,
        user: "Production",
        href: "/rm-outward",
      });
    });
    items.sort((a, b) => b.ts.getTime() - a.ts.getTime());
    return items.slice(0, 5);
  }, [bmrs, pendingGRNs, issuedRecords]);

  const filteredRows = rows.filter((r) => {
    if (catFilter !== "All" && r.rm.category !== catFilter) return false;
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (search && !r.rm.name.toLowerCase().includes(search.toLowerCase()) && !r.rm.botanical.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusBadge = (s: StatusKey) => {
    const map: Record<StatusKey, string> = {
      Critical: "app-badge-red",
      Low: "app-badge-amber",
      Expiring: "app-badge-amber",
      OK: "app-badge-teal",
    };
    return <span className={`app-badge ${map[s]}`}>{s}</span>;
  };

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Dashboard</div>
          <div className="text-[11px] text-muted-foreground mt-px">Today: {today} · {fy}</div>
        </div>
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FY_OPTIONS.map((f) => (
              <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button onClick={() => navigate("/rm-inward")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">+ New GRN</button>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">+ New BMR</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Collapsible alerts */}
        {criticalRows.length > 0 && (
          <div className="alert-strip alert-strip-red flex-col items-stretch !py-0">
            <button
              onClick={() => setRedOpen((v) => !v)}
              className="flex items-center gap-2 w-full py-2 text-left"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">{criticalRows.length} item{criticalRows.length > 1 ? "s" : ""} critically below reorder level</span>
              {redOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {redOpen && (
              <ul className="pb-2 pl-6 space-y-1 text-[11px]">
                {criticalRows.map((r) => (
                  <li key={r.rm.code} className="flex items-center justify-between gap-2 border-t border-current/10 pt-1">
                    <span>{r.rm.name} <span className="opacity-70">({r.rm.botanical})</span></span>
                    <span className="font-medium">{r.rm.currentStock} {r.rm.uom} · need {r.needed} {r.rm.uom}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {expiringRows.length > 0 && (
          <div className="alert-strip alert-strip-amber flex-col items-stretch !py-0">
            <button
              onClick={() => setAmberOpen((v) => !v)}
              className="flex items-center gap-2 w-full py-2 text-left"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">{expiringRows.length} batch{expiringRows.length > 1 ? "es" : ""} expiring in 30 days</span>
              {amberOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {amberOpen && (
              <ul className="pb-2 pl-6 space-y-1 text-[11px]">
                {expiringRows.map((r) => (
                  <li key={r.rm.code} className="flex items-center justify-between gap-2 border-t border-current/10 pt-1">
                    <span>{r.rm.name} — {r.nearest?.batch}</span>
                    <span className="font-medium">{r.nearest?.expiry}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-2.5 mb-4 mt-2">
          <div className="kpi-card">
            <div className="kpi-label">Total RM items</div>
            <div className="kpi-value">{rmData.length}</div>
            <div className="kpi-sub">{new Set(rmData.map((r) => r.category)).size} categories</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Below reorder</div>
            <div className="kpi-value text-kpi-danger">{criticalRows.length + lowRows.length}</div>
            <div className="kpi-sub">Action needed</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Expiring ≤30d</div>
            <div className="kpi-value text-kpi-warning">{expiringRows.length}</div>
            <div className="kpi-sub">Review required</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Stock value</div>
            <div className="kpi-value text-kpi-ok">₹{(totalValue / 1000).toFixed(1)}K</div>
            <div className="kpi-sub">At latest rate</div>
          </div>
          <button
            onClick={() => navigate("/bmr?status=in-process")}
            className="kpi-card text-left hover:ring-1 hover:ring-primary/30 transition-all"
          >
            <div className="kpi-label flex items-center gap-1"><FileText className="w-3 h-3" /> Active BMRs</div>
            <div className="kpi-value">{activeBmrs.length}</div>
            <div className="kpi-sub">In progress / QC pending</div>
          </button>
          <button
            onClick={() => navigate("/rm-inward")}
            className="kpi-card text-left hover:ring-1 hover:ring-primary/30 transition-all"
          >
            <div className="kpi-label flex items-center gap-1"><ClipboardCheck className="w-3 h-3" /> Pending GRNs</div>
            <div className="kpi-value">{pendingGrnCount}</div>
            <div className="kpi-sub">Awaiting QC approval</div>
          </button>
        </div>

        {/* Stock overview table */}
        <div className="app-card">
          <div className="app-card-head flex-wrap gap-2">
            <div className="app-card-title">RM stock overview</div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase">Cat:</span>
                {["All", "Herb", "Extract", "Metal/Mineral", "Animal"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(c)}
                    className={`filter-chip ${catFilter === c ? "filter-chip-active" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-[10px] text-muted-foreground uppercase">Status:</span>
                {["All", "Critical", "Low", "Expiring", "OK"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`filter-chip ${statusFilter === s ? "filter-chip-active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="relative ml-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search RM…"
                  className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40"
                />
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
                {filteredRows.map((r) => {
                  const stockClass = r.status === "Critical" ? "text-kpi-danger font-medium" : r.status === "Low" ? "text-kpi-warning font-medium" : "";
                  const catBadge = r.rm.category === "Herb" ? "app-badge-green" : r.rm.category === "Extract" ? "app-badge-blue" : r.rm.category === "Metal/Mineral" ? "app-badge-purple" : "app-badge-gray";
                  return (
                    <tr key={r.rm.code} className="cursor-pointer" onClick={() => navigate("/stock-ledger")}>
                      <td>
                        <div className="font-medium">{r.rm.name}</div>
                        <div className="text-[10px] text-muted-foreground">{r.rm.botanical} · {r.rm.part}</div>
                      </td>
                      <td><span className={`app-badge ${catBadge}`}>{r.rm.category}</span></td>
                      <td className={stockClass}>{r.rm.currentStock.toFixed(2)}</td>
                      <td>{r.rm.uom}</td>
                      <td>{r.rm.reorder.toFixed(1)}</td>
                      <td className={r.needed > 0 ? "text-kpi-danger" : ""}>{r.needed > 0 ? `${r.needed} ${r.rm.uom}` : "—"}</td>
                      <td>{r.rate || "—"}</td>
                      <td>{r.value.toFixed(0)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {r.batches.length > 0 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className={`underline-offset-2 hover:underline ${r.status === "Expiring" ? "text-kpi-warning font-medium" : ""}`}>
                                {r.nearest?.expiry}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-0" align="end">
                              <div className="px-3 py-2 border-b border-border text-[11px] font-medium">{r.rm.name} — batch expiry</div>
                              <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-[11px]">
                                  <thead>
                                    <tr className="text-left text-muted-foreground">
                                      <th className="px-3 py-1.5 font-medium">Batch</th>
                                      <th className="px-3 py-1.5 font-medium">Expiry</th>
                                      <th className="px-3 py-1.5 font-medium text-right">Qty</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {r.batches.map((b, i) => (
                                      <tr key={i} className="border-t border-border">
                                        <td className="px-3 py-1.5 font-mono">{b.batch}</td>
                                        <td className="px-3 py-1.5">{b.expiry}</td>
                                        <td className="px-3 py-1.5 text-right">{b.qty.toFixed(2)} {r.rm.uom}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-muted-foreground py-6">No items match the selected filters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="app-card mt-4">
          <div className="app-card-head">
            <div className="app-card-title flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Recent activity</div>
          </div>
          {activity.length === 0 ? (
            <div className="px-3.5 py-6 text-center text-xs text-muted-foreground">No recent activity yet</div>
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((a, i) => (
                <li
                  key={i}
                  onClick={() => a.href && navigate(a.href)}
                  className="flex items-center justify-between gap-3 px-3.5 py-2 text-xs hover:bg-secondary cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{a.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-px">by {a.user}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap">{formatRelative(a.ts)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
