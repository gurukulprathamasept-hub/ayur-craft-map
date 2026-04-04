import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBMRs } from "@/context/BMRContext";
import { useStock } from "@/context/StockContext";
import { ArrowLeft, Package, FlaskConical, Search, AlertTriangle, CheckCircle2, Clock, ClipboardList, X, Printer, Download, Edit, RotateCcw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

type IssuedItem = {
  rmName: string;
  botanical?: string;
  qty: number;
  uom: string;
  batch: string;
  expiry: string;
  source: string; // e.g. "BMR-2025-0041" or "Ad-hoc"
  issRef: string;
  timestamp: number;
};

/* ── Issue Summary Panel ── */
const IssueSummary = ({ items, onClear, onClose }: { items: IssuedItem[]; onClear: () => void; onClose: () => void }) => {
  // Aggregate by rmName
  const aggregated = items.reduce<Record<string, { rmName: string; botanical?: string; uom: string; totalQty: number; batches: { batch: string; expiry: string; qty: number; source: string; issRef: string }[] }>>((acc, item) => {
    if (!acc[item.rmName]) {
      acc[item.rmName] = { rmName: item.rmName, botanical: item.botanical, uom: item.uom, totalQty: 0, batches: [] };
    }
    acc[item.rmName].totalQty += item.qty;
    acc[item.rmName].batches.push({ batch: item.batch, expiry: item.expiry, qty: item.qty, source: item.source, issRef: item.issRef });
    return acc;
  }, {});

  const rows = Object.values(aggregated).sort((a, b) => a.rmName.localeCompare(b.rmName));
  const totalItems = rows.length;
  const totalQty = rows.reduce((s, r) => s + r.totalQty, 0);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    doc.setFontSize(16);
    doc.text("RM Issue — Collection Slip", 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${dateStr} ${timeStr}`, 14, 25);
    doc.text(`Total: ${totalItems} materials · ${totalQty.toFixed(3)} qty`, 14, 30);
    doc.setTextColor(0);

    const tableBody: string[][] = [];
    rows.forEach((row, idx) => {
      row.batches.forEach((b, bi) => {
        tableBody.push([
          bi === 0 ? `${idx + 1}` : "",
          bi === 0 ? row.rmName + (row.botanical ? ` (${row.botanical})` : "") : "",
          b.batch,
          b.qty.toFixed(3),
          bi === 0 ? row.uom : "",
          b.source,
          b.issRef,
          "" // collected checkbox
        ]);
      });
    });

    autoTable(doc, {
      startY: 35,
      head: [["#", "Raw Material", "Batch", "Qty", "UOM", "Source", "Issue Ref", "Collected ✓"]],
      body: tableBody,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 98, 255], fontSize: 8 },
      columnStyles: { 0: { cellWidth: 8 }, 7: { cellWidth: 18 } },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(9);
    doc.text("Store Person: ___________________", 14, finalY + 15);
    doc.text("Received By: ___________________", 120, finalY + 15);
    doc.text("Date: ___________________", 14, finalY + 25);

    doc.save(`collection-slip-${Date.now()}.pdf`);
  };

  return (
    <div className="app-card border-2 border-primary/20">
      <div className="app-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <div className="app-card-title">Issue summary — collect all at once</div>
          <span className="app-badge app-badge-teal ml-2">{totalItems} drugs · {totalQty.toFixed(3)} total</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadPDF} className="px-2.5 py-1 rounded-md border border-border text-[10px] font-medium hover:bg-secondary transition-all flex items-center gap-1 text-primary">
            <Download className="w-3 h-3" /> PDF
          </button>
          <button onClick={() => window.print()} className="px-2.5 py-1 rounded-md border border-border text-[10px] font-medium hover:bg-secondary transition-all flex items-center gap-1">
            <Printer className="w-3 h-3" /> Print
          </button>
          <button onClick={onClear} className="px-2.5 py-1 rounded-md border border-border text-[10px] font-medium hover:bg-secondary transition-all text-destructive">Clear</button>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="p-3.5">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Raw material</div><div>Total qty</div><div>UOM</div><div>Issue sources</div>
        </div>
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-2 py-2.5 items-start text-xs ${i < rows.length - 1 ? "border-b border-border" : ""}`}>
            <div>
              <div className="font-medium">{row.rmName}</div>
              {row.botanical && <div className="text-[10px] text-muted-foreground italic">{row.botanical}</div>}
            </div>
            <div className="font-semibold text-primary">{row.totalQty.toFixed(3)}</div>
            <div>{row.uom}</div>
            <div className="space-y-0.5">
              {row.batches.map((b, j) => (
                <div key={j} className="text-[10px] text-muted-foreground">
                  <span className="app-badge app-badge-teal text-[9px] mr-1">{b.batch}</span>
                  {b.qty.toFixed(3)} — {b.source} ({b.issRef})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Single-drug issue detail ── */
const SingleDrugIssueDetail = ({ onBack, onIssued }: { onBack: () => void; onIssued: (items: IssuedItem[]) => void }) => {
  const { rmData, getStockForRM, issueStock } = useStock();

  const rmItems = rmData.map(rm => {
    const stock = getStockForRM(rm.name);
    return { name: rm.name, bot: rm.botanical, stock: stock ? `${stock.available} ${stock.uom}` : "—", batch: stock?.batch || "—", expiry: stock?.expiry || "—", uom: rm.uom, available: rm.currentStock };
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleConfirm = () => {
    const lines = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => {
        const rm = rmItems.find(r => r.name === name);
        return { rmName: name, qty, batch: rm?.batch || "—", expiry: rm?.expiry || "—" };
      });
    if (lines.length === 0) { toast.error("No quantities entered"); return; }
    const issRef = `ISS-${Date.now().toString().slice(-7)}`;
    issueStock(issRef, lines, { type: "single", source: "Ad-hoc" });
    
    // Report issued items to parent
    const issuedItems: IssuedItem[] = lines.map(l => {
      const rm = rmItems.find(r => r.name === l.rmName);
      return { rmName: l.rmName, botanical: rm?.bot, qty: l.qty, uom: rm?.uom || "kg", batch: l.batch, expiry: l.expiry, source: "Ad-hoc", issRef, timestamp: Date.now() };
    });
    onIssued(issuedItems);
    
    toast.success(`Issued ${lines.length} item(s) successfully`);
    onBack();
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <button onClick={onBack} className="p-1 rounded hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <div className="text-[15px] font-medium">Single RM issue</div>
          <div className="text-[11px] text-muted-foreground mt-px">Ad-hoc dispensing</div>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button onClick={handleConfirm} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Confirm issue</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="form-field"><label>Issue date</label><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="form-field"><label>Purpose / Dept</label><input placeholder="e.g. QC Lab, R&D, Maintenance" /></div>
          <div className="form-field"><label>Requested by</label><input placeholder="Person requesting" /></div>
          <div className="form-field"><label>Approved by</label><input placeholder="Authorising officer" /></div>
          <div className="form-field"><label>Issued by</label><input placeholder="Store person" /></div>
        </div>
        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Select raw material to issue</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Raw material</div><div>Available stock</div><div>FIFO batch</div><div>Expiry</div><div>Qty to issue</div>
            </div>
            {rmItems.map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 py-2.5 items-center text-xs ${i < rmItems.length - 1 ? "border-b border-border" : ""}`}>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.bot}</div>
                </div>
                <div className={item.available === 0 ? "text-destructive font-medium" : ""}>{item.stock}</div>
                <div><span className="app-badge app-badge-teal">{item.batch}</span></div>
                <div>{item.expiry}</div>
                <div>
                  <input
                    type="number"
                    className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]"
                    placeholder="0.000"
                    disabled={item.available === 0}
                    onChange={e => setQuantities(prev => ({ ...prev, [item.name]: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <div className="form-field"><label>Remarks</label><textarea className="min-h-[60px]" placeholder="Reason for ad-hoc issue..." /></div>
        </div>
      </div>
    </>
  );
};

/* ── Batch issue detail (with live stock & partial issue) ── */
const BatchIssueDetail = ({ onBack, onIssued, bmrLabel, bmrIngredients }: { onBack: () => void; onIssued: (items: IssuedItem[]) => void; bmrLabel: string; bmrIngredients?: { name: string; botanical?: string; req: number; unit: string }[] }) => {
  const { getStockForRM, issueStock } = useStock();

  const baseIngredients = bmrIngredients || [
    { name: "Amla / Amalaki", botanical: "Emblica officinalis", req: 3.333, unit: "kg" },
    { name: "Haritaki", botanical: "Terminalia chebula", req: 3.333, unit: "kg" },
    { name: "Vibhitaki", botanical: "Terminalia bellirica", req: 3.334, unit: "kg" },
  ];

  const buildIngredients = () => baseIngredients.map(ing => {
    const stock = getStockForRM(ing.name);
    const available = stock?.available ?? 0;
    const status = available === 0 ? "unavailable" as const : available < ing.req ? "low" as const : "available" as const;
    return {
      ...ing,
      botanical: ing.botanical || "",
      batch: stock?.batch || "—",
      batchColor: stock?.batchColor || "gray",
      expiry: stock?.expiry || "—",
      available,
      status,
      qtyToIssue: status === "unavailable" ? 0 : Math.min(ing.req, available),
      issueChecked: status !== "unavailable",
    };
  });

  const [ingredients, setIngredients] = useState(buildIngredients);

  const toggleIssue = (idx: number) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, issueChecked: !ing.issueChecked, qtyToIssue: !ing.issueChecked ? Math.min(ing.req, ing.available) : 0 } : ing));
  };

  const updateQty = (idx: number, val: number) => {
    setIngredients(prev => prev.map((ing, i) => i === idx ? { ...ing, qtyToIssue: val } : ing));
  };

  const issuedCount = ingredients.filter(i => i.issueChecked && i.qtyToIssue > 0).length;
  const pendingCount = ingredients.filter(i => !i.issueChecked || i.qtyToIssue === 0).length;

  const issRef = `ISS-${Date.now().toString().slice(-7)}`;

  const handleConfirm = () => {
    const lines = ingredients
      .filter(i => i.issueChecked && i.qtyToIssue > 0)
      .map(i => ({ rmName: i.name, qty: i.qtyToIssue, batch: i.batch, expiry: i.expiry }));
    if (lines.length === 0) { toast.error("Nothing to issue"); return; }
    issueStock(issRef, lines, { type: "batch", source: bmrLabel });
    
    // Report issued items to parent
    const issuedItems: IssuedItem[] = lines.map(l => {
      const ing = ingredients.find(i => i.name === l.rmName);
      return { rmName: l.rmName, botanical: ing?.botanical, qty: l.qty, uom: ing?.unit || "kg", batch: l.batch, expiry: l.expiry, source: bmrLabel, issRef, timestamp: Date.now() };
    });
    onIssued(issuedItems);
    
    toast.success(`Issued ${lines.length} item(s). ${pendingCount > 0 ? `${pendingCount} item(s) marked pending.` : ""}`);
    onBack();
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <button onClick={onBack} className="p-1 rounded hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM issue to production</div>
          <div className="text-[11px] text-muted-foreground mt-px">{issRef} · Against {bmrLabel}</div>
        </div>
        <div className="flex items-center gap-1.5 mr-2">
          <span className="app-badge app-badge-teal flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{issuedCount} issued</span>
          {pendingCount > 0 && <span className="app-badge app-badge-amber flex items-center gap-1"><Clock className="w-3 h-3" />{pendingCount} pending</span>}
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button onClick={handleConfirm} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
          {pendingCount > 0 ? "Issue available & mark pending" : "Confirm issue"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-2.5">
          <div className="form-field"><label>Issue slip no.</label><input value={issRef} disabled className="bg-secondary" /></div>
          <div className="form-field"><label>BMR reference</label><input value={bmrLabel} disabled className="bg-secondary" /></div>
          <div className="form-field"><label>Issue date</label><input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
          <div className="form-field"><label>Requested by</label><input defaultValue="Suresh Patil (Production)" /></div>
          <div className="form-field"><label>Approved by</label><input defaultValue="Dr. A. Kulkarni (Tech. Staff)" /></div>
          <div className="form-field"><label>Issued by</label><input defaultValue="Ramesh Nair (Store)" /></div>
        </div>

        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Ingredients to issue — FIFO batch auto-selected (live stock)</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[auto_2fr_1fr_0.8fr_1fr_0.8fr_1.2fr_1fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Issue</div><div>RM</div><div>Required</div><div>Available</div><div>FIFO batch</div><div>Expiry</div><div>Qty to issue</div><div>Status</div>
            </div>
            {ingredients.map((item, i) => {
              const isShort = item.status === "low";
              const isOut = item.status === "unavailable";
              const rowBg = isOut ? "bg-destructive/5" : isShort ? "bg-amber-500/5" : "";

              return (
                <div key={i} className={`grid grid-cols-[auto_2fr_1fr_0.8fr_1fr_0.8fr_1.2fr_1fr] gap-2 py-2 items-center text-xs ${i < ingredients.length - 1 ? "border-b border-border" : ""} ${rowBg}`}>
                  <div className="flex justify-center">
                    <input type="checkbox" checked={item.issueChecked} onChange={() => toggleIssue(i)} disabled={isOut} className="w-3.5 h-3.5 rounded border-border accent-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground">{item.botanical}</div>
                  </div>
                  <div>{item.req} {item.unit}</div>
                  <div className={isOut ? "text-destructive font-medium" : isShort ? "text-kpi-warning font-medium" : "text-kpi-ok"}>
                    {item.available} {item.unit}
                  </div>
                  <div>
                    {isOut ? <span className="text-[10px] text-muted-foreground italic">No stock</span>
                      : <span className={`app-badge app-badge-${item.batchColor}`}>{item.batch}</span>}
                  </div>
                  <div>{isOut ? "—" : item.expiry}</div>
                  <div>
                    {isOut ? <span className="text-[10px] text-muted-foreground">—</span>
                      : <input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]" value={item.qtyToIssue} onChange={e => updateQty(i, parseFloat(e.target.value) || 0)} max={item.available} disabled={!item.issueChecked} />}
                  </div>
                  <div>
                    {isOut ? (
                      <span className="app-badge bg-destructive/10 text-destructive flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Pending</span>
                    ) : isShort && item.qtyToIssue < item.req ? (
                      <span className="app-badge app-badge-amber flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> Partial</span>
                    ) : item.issueChecked ? (
                      <span className="app-badge app-badge-teal flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                    ) : (
                      <span className="app-badge app-badge-amber flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Skipped</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {ingredients.some(i => i.status === "unavailable") && (
          <div className="alert-strip alert-strip-amber mt-1.5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-xs">Pending items detected</div>
              <div className="text-[11px] mt-0.5">
                {ingredients.filter(i => i.status === "unavailable").map(i => i.name).join(", ")} — stock unavailable. Pending items can be issued later when stock arrives.
              </div>
            </div>
          </div>
        )}

        {ingredients.some(i => i.status === "low") && (
          <div className="alert-strip alert-strip-amber mt-1.5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-xs">Low stock warning</div>
              <div className="text-[11px] mt-0.5">
                {ingredients.filter(i => i.status === "low").map(i => `${i.name} (need ${i.req}, have ${i.available} ${i.unit})`).join("; ")}. Partial quantity will be issued.
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Main RMOutward page ── */
const RMOutward = () => {
  const navigate = useNavigate();
  const { bmrs } = useBMRs();
  const { issuedRecords, reverseIssue } = useStock();
  const [view, setView] = useState<"list" | "batch" | "single">("list");
  const [selectedBMR, setSelectedBMR] = useState<string>("");
  const [selectedBMRIngredients, setSelectedBMRIngredients] = useState<{ name: string; botanical?: string; req: number; unit: string }[] | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const handleIssued = (items: IssuedItem[]) => {
    setIssuedItems(prev => [...prev, ...items]);
    setShowSummary(true);
  };

  const handleEditIssue = (issRef: string) => {
    const record = issuedRecords.find(r => r.issRef === issRef);
    if (!record) return;
    reverseIssue(issRef);
    if (record.type === "batch") {
      setSelectedBMR(record.source);
      setView("batch");
    } else {
      setView("single");
    }
    toast.success(`Issue ${issRef} reversed — stock restored. Re-issue when ready.`);
  };

  if (view === "batch") return <BatchIssueDetail onBack={() => setView("list")} onIssued={handleIssued} bmrLabel={selectedBMR} bmrIngredients={selectedBMRIngredients} />;
  if (view === "single") return <SingleDrugIssueDetail onBack={() => setView("list")} onIssued={handleIssued} />;

  const demoBatchIssues = [
    { id: "ISS-2025-0094", bmr: "BMR-2025-0041", product: "Triphala Churna", batchSize: "10 kg", date: "14 Jun 2025", status: "Pending", items: 3 },
    { id: "ISS-2025-0091", bmr: "BMR-2025-0039", product: "Chyawanprash", batchSize: "50 kg", date: "12 Jun 2025", status: "Issued", items: 8 },
    { id: "ISS-2025-0088", bmr: "BMR-2025-0037", product: "Ashwagandharishta", batchSize: "100 L", date: "10 Jun 2025", status: "Issued", items: 5 },
  ];

  const demoSingleIssues = [
    { id: "ISS-2025-0093", rm: "Ashwagandha root powder", qty: "2.5 kg", purpose: "QC Lab testing", date: "13 Jun 2025", status: "Issued" },
    { id: "ISS-2025-0090", rm: "Ghee (Cow)", qty: "5 kg", purpose: "R&D trial batch", date: "11 Jun 2025", status: "Issued" },
  ];

  const contextBatchIssues = bmrs.filter(b => b.status === "In process" || b.status === "Draft").map(b => ({
    id: `ISS-${b.batchNo.replace("BATCH-", "")}`,
    bmr: b.batchNo,
    product: b.productName,
    batchSize: `${b.batchSize} ${b.batchUnit}`,
    date: b.startDate,
    status: "Pending",
    items: b.ingredients.length,
  }));

  const allBatch = [...contextBatchIssues, ...demoBatchIssues];
  const filteredBatch = allBatch.filter(i => i.product.toLowerCase().includes(search.toLowerCase()) || i.bmr.toLowerCase().includes(search.toLowerCase()));
  const filteredSingle = demoSingleIssues.filter(i => i.rm.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM Outward / Issue</div>
          <div className="text-[11px] text-muted-foreground mt-px">Issue raw materials — batch (BMR) or single drug</div>
        </div>
        {issuedItems.length > 0 && (
          <button onClick={() => setShowSummary(!showSummary)} className={`px-3.5 py-1.5 rounded-md border text-xs font-medium transition-all flex items-center gap-1.5 ${showSummary ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-secondary"}`}>
            <ClipboardList className="w-3.5 h-3.5" /> Summary ({issuedItems.length})
          </button>
        )}
        <button onClick={() => { setSelectedBMR(""); setView("single"); }} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> New single issue
        </button>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> New batch issue
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Issue Summary Panel */}
        {showSummary && issuedItems.length > 0 && (
          <div className="mb-4">
            <IssueSummary items={issuedItems} onClear={() => { setIssuedItems([]); setShowSummary(false); }} onClose={() => setShowSummary(false)} />
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product, BMR no., or RM name..." className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-xs bg-background" />
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="history" className="text-xs">Issue History ({issuedRecords.filter(r => r.status === "issued").length})</TabsTrigger>
            <TabsTrigger value="batch" className="text-xs">Batch issue (BMR)</TabsTrigger>
            <TabsTrigger value="single" className="text-xs">Single drug issue</TabsTrigger>
          </TabsList>

          {/* Issue History */}
          <TabsContent value="history">
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">All issued records</div></div>
              <div className="divide-y divide-border">
                <div className="grid grid-cols-[1fr_1.2fr_1.5fr_0.8fr_0.6fr_0.6fr_80px] gap-2 px-3.5 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                  <div>Issue Ref</div><div>Source</div><div>RM Items</div><div>Date</div><div>Total Qty</div><div>Status</div><div></div>
                </div>
                {(() => {
                  const allRecords = issuedRecords.filter(r => {
                    if (!search) return true;
                    const s = search.toLowerCase();
                    return r.issRef.toLowerCase().includes(s) || r.source.toLowerCase().includes(s) || r.lines.some(l => l.rmName.toLowerCase().includes(s));
                  });
                  if (allRecords.length === 0) return (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                      No issue records yet. Issue materials via batch or single drug to see history here.
                    </div>
                  );
                  return allRecords.map(record => {
                    const totalQty = record.lines.reduce((s, l) => s + l.qty, 0);
                    return (
                      <div key={record.issRef} className="grid grid-cols-[1fr_1.2fr_1.5fr_0.8fr_0.6fr_0.6fr_80px] gap-2 px-3.5 py-2.5 items-center text-xs hover:bg-secondary/50 transition-colors">
                        <div className="font-medium text-primary font-mono">{record.issRef}</div>
                        <div>
                          <div className="font-medium">{record.source}</div>
                          <div className="text-[10px] text-muted-foreground">{record.type === "batch" ? "Batch issue" : "Ad-hoc"}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{record.lines.map(l => l.rmName).join(", ")}</div>
                        <div>{record.date}</div>
                        <div>{totalQty.toFixed(3)}</div>
                        <div>
                          {record.status === "issued" ? (
                            <span className="app-badge app-badge-teal">Issued</span>
                          ) : (
                            <span className="app-badge app-badge-amber flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reversed</span>
                          )}
                        </div>
                        <div>
                          {record.status === "issued" && (
                            <button onClick={() => handleEditIssue(record.issRef)}
                              className="px-2.5 py-1 rounded-md border border-border text-[10px] font-medium hover:bg-secondary transition-all flex items-center gap-1">
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">Batch issues against BMR</div></div>
              <div className="divide-y divide-border">
                {filteredBatch.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No batch issues found.</div>
                )}
                {filteredBatch.map((item, i) => (
                  <div key={i} onClick={() => {
                    setSelectedBMR(`${item.bmr} · ${item.product}`);
                    // Find BMR and pass real ingredients
                    const bmr = bmrs.find(b => b.batchNo === item.bmr);
                    if (bmr) {
                      setSelectedBMRIngredients(bmr.ingredients.map(ing => ({
                        name: ing.name, botanical: undefined, req: ing.qty, unit: ing.unit,
                      })));
                    } else {
                      setSelectedBMRIngredients(undefined);
                    }
                    setView("batch");
                  }} className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.6fr_0.5fr] gap-2 px-3.5 py-2.5 items-center text-xs hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="font-medium text-primary">{item.id}</div>
                    <div>
                      <div className="font-medium">{item.product}</div>
                      <div className="text-[10px] text-muted-foreground">{item.bmr}</div>
                    </div>
                    <div>{item.batchSize}</div>
                    <div>{item.date}</div>
                    <div>{item.items} items</div>
                    <div>
                      <span className={`app-badge ${item.status === "Issued" ? "app-badge-teal" : "app-badge-amber"}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="single">
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">Single drug / ad-hoc issues</div></div>
              <div className="divide-y divide-border">
                {filteredSingle.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No single drug issues found.</div>
                )}
                {filteredSingle.map((item, i) => (
                  <div key={i} onClick={() => setView("single")} className="grid grid-cols-[1fr_1.5fr_0.8fr_1fr_0.8fr_0.5fr] gap-2 px-3.5 py-2.5 items-center text-xs hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="font-medium text-primary">{item.id}</div>
                    <div className="font-medium">{item.rm}</div>
                    <div>{item.qty}</div>
                    <div className="text-muted-foreground">{item.purpose}</div>
                    <div>{item.date}</div>
                    <div><span className="app-badge app-badge-teal">{item.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default RMOutward;
