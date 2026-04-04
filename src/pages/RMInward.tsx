import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStock, type PendingGRN, type PendingGRNLine, type QCResult, type GRNDraft } from "@/context/StockContext";
import { useSupplier } from "@/context/SupplierContext";
import { toast } from "@/hooks/use-toast";
import { X, Search, CheckCircle2, XCircle, AlertCircle, FlaskConical, ShieldCheck, ShieldX, RotateCcw, Info, ArrowLeft, FileText, Trash2, Clock, Edit, Package } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type InwardLine = {
  rmCode: string;
  rmName: string;
  botanical: string;
  uom: string;
  batch: string;
  expiry: string;
  qty: number;
  rate: string;
  searchOpen: boolean;
  searchTerm: string;
};

const emptyLine = (): InwardLine => ({
  rmCode: "", rmName: "", botanical: "", uom: "",
  batch: "", expiry: "", qty: 0, rate: "",
  searchOpen: false, searchTerm: "",
});

const SECTION_META: Record<string, { label: string; badge: string; badgeClass: string }> = {
  "Organoleptic": { label: "A. Organoleptic evaluation", badge: "Visual / sensory", badgeClass: "app-badge-blue" },
  "Physicochemical": { label: "B. Physicochemical parameters", badge: "Lab measurements", badgeClass: "app-badge-purple" },
  "Identity & Assay": { label: "C. Identity & assay", badge: "TLC / HPTLC / HPLC", badgeClass: "app-badge-teal" },
  "Safety": { label: "D. Safety parameters", badge: "Heavy metals & microbiology", badgeClass: "app-badge-red" },
};

const RMInward = () => {
  const navigate = useNavigate();
  const {
    rmData, getNextGRN, incrementGRN,
    submitForQC, updateQCResult, updateQCLineField, approveGRNLine, rejectGRNLine, finalApproveGRN, pendingGRNs,
    drafts, saveDraft, deleteDraft, reverseGRN,
  } = useStock();
  const { suppliers } = useSupplier();
  const [selectedSupplier, setSelectedSupplier] = useState("SUP-001");
  const [step, setStep] = useState<"drafts" | "entry" | "qc" | "done">("drafts");
  const [lines, setLines] = useState<InwardLine[]>([emptyLine()]);
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null);
  const [activeRMTab, setActiveRMTab] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [grnDate, setGrnDate] = useState(new Date().toISOString().split("T")[0]);
  const [grnSearch, setGrnSearch] = useState("");

  const { nextGRN, prevGRN } = getNextGRN();
  const [grnNo, setGrnNo] = useState(nextGRN);
  const currentGRN = pendingGRNs.find(g => g.grnNo === grnNo);

  useEffect(() => { if (step === "entry" && !draftId) setGrnNo(nextGRN); }, [nextGRN, step, draftId]);

  const startNewGRN = () => {
    setDraftId(null);
    setGrnNo(nextGRN);
    setSelectedSupplier("SUP-001");
    setLines([emptyLine()]);
    setInvoiceNo("");
    setInvoiceDate("");
    setGrnDate(new Date().toISOString().split("T")[0]);
    setStep("entry");
  };

  const resumeDraft = (draft: GRNDraft) => {
    setDraftId(draft.id);
    setGrnNo(draft.grnNo);
    setSelectedSupplier(draft.supplierId);
    setInvoiceNo(draft.invoiceNo);
    setInvoiceDate(draft.invoiceDate);
    setGrnDate(draft.date);
    setLines([
      ...draft.lines.map(l => ({
        rmCode: l.rmCode, rmName: l.rmName, botanical: l.botanical, uom: l.uom,
        batch: l.batch, expiry: l.expiry, qty: l.qty, rate: l.rate,
        searchOpen: false, searchTerm: "",
      })),
      emptyLine(),
    ]);
    setStep(draft.step);
  };

  const handleSaveDraft = () => {
    const id = draftId || `draft-${Date.now()}`;
    const filledL = lines.filter(l => l.rmCode);
    const draft: GRNDraft = {
      id,
      grnNo,
      date: grnDate,
      supplierId: selectedSupplier,
      supplierName: suppliers.find(s => s.id === selectedSupplier)?.name || selectedSupplier,
      invoiceNo,
      invoiceDate,
      lines: filledL.map(l => ({
        rmCode: l.rmCode, rmName: l.rmName, botanical: l.botanical, uom: l.uom,
        batch: l.batch, expiry: l.expiry, qty: l.qty, rate: l.rate,
      })),
      step: step === "qc" ? "qc" : "entry",
      savedAt: "",
    };
    saveDraft(draft);
    setDraftId(id);
    toast({ title: "Draft saved", description: `GRN ${grnNo} saved. You can resume from the drafts list.` });
  };

  // Auto-add new line
  useEffect(() => {
    if (step !== "entry") return;
    const lastLine = lines[lines.length - 1];
    if (lastLine && lastLine.rmCode) {
      setLines(prev => [...prev, emptyLine()]);
    }
  }, [lines, step]);

  const updateLine = (i: number, field: keyof InwardLine, val: string | number | boolean) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  };

  const selectRM = (i: number, rmCode: string) => {
    const rm = rmData.find(r => r.code === rmCode);
    if (!rm) return;
    setLines(prev => prev.map((l, idx) => idx === i ? {
      ...l, rmCode: rm.code, rmName: rm.name, botanical: rm.botanical, uom: rm.uom,
      searchOpen: false, searchTerm: "",
    } : l));
  };

  const removeLine = (i: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, idx) => idx !== i));
    if (selectedLineIdx === i) setSelectedLineIdx(null);
  };

  const filledLines = useMemo(() => lines.filter(l => l.rmCode), [lines]);

  const handleSubmitForQC = () => {
    if (filledLines.length === 0) {
      toast({ title: "No line items", description: "Add at least one RM.", variant: "destructive" });
      return;
    }
    const validLines = filledLines.filter(l => l.qty > 0);
    if (validLines.length === 0) {
      toast({ title: "Invalid quantities", description: "Enter qty > 0.", variant: "destructive" });
      return;
    }

    const pendingLines: PendingGRNLine[] = validLines.map((l, idx) => {
      const rm = rmData.find(r => r.code === l.rmCode);
      const qcResults: QCResult[] = (rm?.qcSpecs || []).map(s => ({
        parameter: s.parameter,
        spec: s.spec,
        section: s.section || "Physicochemical",
        unit: s.unit || "",
        actual: "",
        pass: null,
      }));
      return {
        rmCode: l.rmCode,
        rmName: l.rmName,
        botanical: rm?.botanical || l.botanical,
        qty: l.qty,
        batch: l.batch,
        expiry: l.expiry,
        rate: l.rate,
        uom: l.uom,
        category: rm?.category || "Herb",
        part: rm?.part || "",
        qcResults,
        qcStatus: "pending",
        disposition: null,
        dispositionReason: "",
        sampleQty: "",
        sampleDrawnBy: "",
        sampleDrawnOn: new Date().toISOString().split("T")[0],
        arNo: `AR/${new Date().getFullYear()}-${grnNo.split("-").pop()}-${String(idx + 1).padStart(2, "0")}`,
        analystRemarks: "",
        analystSigned: false,
        analystSignedAt: null,
        approverSigned: false,
        approverSignedAt: null,
      };
    });

    const grn: PendingGRN = {
      grnNo,
      date: new Date().toLocaleDateString("en-IN"),
      supplier: suppliers.find(s => s.id === selectedSupplier)?.name || selectedSupplier,
      lines: pendingLines,
      status: "pending_qc",
    };

    submitForQC(grn);
    incrementGRN();
    setStep("qc");
    setActiveRMTab(0);
    toast({ title: "Submitted for QC", description: "Complete QC sampling to update stock ledger." });
  };

  const handleFinalApprove = () => {
    if (!currentGRN) return;
    // Check all lines have dispositions set
    const allDisposed = currentGRN.lines.every(l => l.disposition !== null);
    if (!allDisposed) {
      toast({ title: "Set disposition for all items", description: "Select Approve, Retest, or Reject for each RM.", variant: "destructive" });
      return;
    }
    // For approve dispositions, check all tests are passed
    const approveLines = currentGRN.lines.filter(l => l.disposition === "approve");
    for (const l of approveLines) {
      const hasFails = l.qcResults.some(r => r.pass === false);
      if (hasFails) {
        toast({ title: "Cannot approve with failed tests", description: `${l.rmName} has failed tests. Select Reject or Retest instead.`, variant: "destructive" });
        return;
      }
      const hasUntested = l.qcResults.some(r => r.pass === null);
      if (hasUntested) {
        toast({ title: "Incomplete QC", description: `${l.rmName} has untested parameters.`, variant: "destructive" });
        return;
      }
    }

    // Sign approver
    currentGRN.lines.forEach((_, i) => {
      const line = currentGRN.lines[i];
      if (line.disposition === "approve") {
        approveGRNLine(grnNo, i);
        updateQCLineField(grnNo, i, {
          approverSigned: true,
          approverSignedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        });
      } else if (line.disposition === "reject") {
        rejectGRNLine(grnNo, i);
      }
      // retest keeps status as pending
    });

    finalApproveGRN(grnNo);
    setStep("done");
    toast({ title: "GRN finalised", description: "Stock ledger updated for approved items." });
  };

  const invoiceTotal = filledLines.reduce((s, l) => s + l.qty * (parseFloat(l.rate) || 0), 0);

  const selectedRM = selectedLineIdx !== null ? rmData.find(r => r.code === lines[selectedLineIdx]?.rmCode) : null;

  const getFilteredRM = (searchTerm: string) => {
    if (!searchTerm) return rmData;
    const s = searchTerm.toLowerCase();
    return rmData.filter(rm =>
      rm.name.toLowerCase().includes(s) || rm.botanical.toLowerCase().includes(s) || rm.code.toLowerCase().includes(s)
    );
  };

  const stepNum = step === "drafts" ? 0 : step === "entry" ? 2 : step === "qc" ? 3 : 4;

  // QC helpers for current active RM tab
  const activeLine = currentGRN?.lines[activeRMTab];
  const activeQCResults = activeLine?.qcResults || [];
  const sections = useMemo(() => {
    const secs: string[] = [];
    activeQCResults.forEach(r => { if (!secs.includes(r.section)) secs.push(r.section); });
    return secs;
  }, [activeQCResults]);

  const passCount = activeQCResults.filter(r => r.pass === true).length;
  const failCount = activeQCResults.filter(r => r.pass === false).length;
  const pendingCount = activeQCResults.filter(r => r.pass === null).length;
  const totalTests = activeQCResults.length;
  const overallStatus = failCount > 0 ? "fail" : pendingCount > 0 ? "pending" : "pass";

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        {step !== "drafts" && (
          <button onClick={() => {
            if (step === "entry") setStep("drafts");
            else if (step === "qc") setStep("entry");
            else if (step === "done") setStep("qc");
          }}
            className="p-1.5 rounded-md border border-border hover:bg-secondary transition-all mr-1">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <div className="text-[15px] font-medium">
            {step === "drafts" ? "RM Inward — GRN Management"
              : step === "qc" ? `QC sampling & approval — ${grnNo}`
              : step === "done" ? `GRN finalised — ${grnNo}`
              : `RM inward — new GRN`}
          </div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {step === "drafts" ? `${drafts.length} draft${drafts.length !== 1 ? "s" : ""} saved · ${pendingGRNs.filter(g => g.status === "pending_qc").length} pending QC`
              : step === "qc" ? `Step 3 of 4 · ${currentGRN?.supplier} · Received ${currentGRN?.date} · Schedule U §II-D`
              : step === "done" ? `Completed · Stock ledger updated`
              : `${grnNo} · Draft · Schedule U §II`}
          </div>
        </div>
        {step === "drafts" && (
          <button onClick={startNewGRN}
            className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
            + New GRN
          </button>
        )}
        {step === "entry" && (
          <>
            <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
            <button onClick={handleSaveDraft} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save draft</button>
            <button onClick={handleSubmitForQC}
              className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              Submit for QC
            </button>
          </>
        )}
        {step === "qc" && (
          <>
            <button onClick={handleSaveDraft} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save progress</button>
            <button onClick={handleFinalApprove}
              className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              Finalise & approve
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Drafts list */}
        {step === "drafts" && (
          <div>
            {/* Pending QC section */}
            {pendingGRNs.filter(g => g.status === "pending_qc").length > 0 && (
              <div className="app-card mb-4">
                <div className="app-card-head"><div className="app-card-title">Pending QC</div></div>
                <div className="p-3.5 space-y-2">
                  {pendingGRNs.filter(g => g.status === "pending_qc").map(grn => (
                    <div key={grn.grnNo} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                          <FlaskConical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{grn.grnNo}</div>
                          <div className="text-[11px] text-muted-foreground">{grn.supplier} · {grn.date} · {grn.lines.length} item{grn.lines.length !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                      <button onClick={() => { setGrnNo(grn.grnNo); setStep("qc"); setActiveRMTab(0); }}
                        className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
                        Continue QC
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved drafts */}
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">Saved Drafts</div></div>
              <div className="p-3.5">
                {drafts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">No saved drafts</div>
                    <div className="text-[11px] text-muted-foreground mt-1">Click "+ New GRN" to start a new goods receipt</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {drafts.sort((a, b) => b.savedAt.localeCompare(a.savedAt)).map(draft => (
                      <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{draft.grnNo}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {draft.supplierName} · {draft.lines.length} item{draft.lines.length !== 1 ? "s" : ""} · Saved {draft.savedAt}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => resumeDraft(draft)}
                            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
                            Resume
                          </button>
                          <button onClick={() => { deleteDraft(draft.id); toast({ title: "Draft deleted" }); }}
                            className="p-1.5 rounded-md border border-border hover:bg-destructive/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stepper - show for entry/qc/done */}
        {step !== "drafts" && (
        <div className="flex items-center gap-0 mb-4">
          {[
            { n: 1, label: "GRN header" },
            { n: 2, label: "Line items" },
            { n: 3, label: "QC sampling" },
            { n: 4, label: "Approve & release" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-initial">
              <div className="flex items-center gap-1.5 text-[11px]">
                <div className={`step-num ${s.n < stepNum ? "step-num-done" : s.n === stepNum ? "step-num-current" : "step-num-todo"}`}>{s.n}</div>
                <span className={s.n === stepNum ? "text-foreground font-medium" : "text-muted-foreground"}>{s.label}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />}
            </div>
          ))}
        </div>
        )}

        {/* STEP: Entry */}
        {step === "entry" && (
          <>
            {/* Receipt header */}
            <div className="app-card mb-2.5">
              <div className="app-card-head"><div className="app-card-title">Receipt header</div></div>
              <div className="p-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-field">
                    <label>GRN number</label>
                    <input value={grnNo} onChange={e => setGrnNo(e.target.value)} />
                    {prevGRN && <span className="text-[10px] text-muted-foreground mt-0.5">Previous: {prevGRN}</span>}
                  </div>
                  <div className="form-field"><label>GRN date</label><input type="date" value={grnDate} onChange={e => setGrnDate(e.target.value)} /></div>
                  <div className="form-field">
                    <label>Supplier</label>
                    <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                      {suppliers.filter(s => s.active).map(s => (
                        <option key={s.id} value={s.id}>{s.name}, {s.city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field"><label>Invoice / challan no.</label><input placeholder="INV-XXXX" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
                  <div className="form-field"><label>Invoice date</label><input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
                  <div className="form-field">
                    <label>Source type</label>
                    <input disabled value={suppliers.find(s => s.id === selectedSupplier)?.sourceType || "—"} className="bg-secondary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Line items ({filledLines.length})</div>
              </div>
              <div className="p-3.5">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_32px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                  <div>RM name</div><div>Batch no.</div><div>Expiry</div><div>Qty recd.</div><div>Unit rate (₹)</div><div>Value (₹)</div><div></div>
                </div>

                {lines.map((line, i) => (
                  <div key={i}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_32px] gap-2 py-1.5 items-center border-b border-border last:border-b-0 ${selectedLineIdx === i ? "bg-secondary/50 rounded" : ""}`}
                    onClick={() => line.rmCode && setSelectedLineIdx(selectedLineIdx === i ? null : i)}>

                    <div className="relative" onClick={e => e.stopPropagation()}>
                      {line.rmCode ? (
                        <div>
                          <div className="font-medium text-xs">{line.rmName}</div>
                          <div className="text-[10px] text-muted-foreground">{line.rmCode} · {line.botanical}</div>
                        </div>
                      ) : (
                        <>
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <input type="text" placeholder="Search RM name, code, or botanical…"
                              className="w-full pl-7 pr-2 py-1.5 border border-border rounded-md text-xs"
                              value={line.searchTerm}
                              onChange={e => { updateLine(i, "searchTerm", e.target.value); updateLine(i, "searchOpen", true); }}
                              onFocus={() => updateLine(i, "searchOpen", true)}
                            />
                          </div>
                          {line.searchOpen && (
                            <div className="absolute left-0 top-full mt-1 w-72 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                              {getFilteredRM(line.searchTerm).map(rm => (
                                <button key={rm.code} onClick={() => selectRM(i, rm.code)}
                                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-secondary text-xs">
                                  <div className="font-medium">{rm.name}</div>
                                  <div className="text-[10px] text-muted-foreground">{rm.code} · {rm.botanical} · {rm.uom}</div>
                                </button>
                              ))}
                              {getFilteredRM(line.searchTerm).length === 0 && (
                                <div className="text-center py-3 text-xs text-muted-foreground">No RM found</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <input className="w-full px-2 py-1 border border-border rounded-md text-[11px]" placeholder="Batch"
                        value={line.batch} onChange={e => updateLine(i, "batch", e.target.value)} disabled={!line.rmCode} />
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <input type="date" className="w-full px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.expiry} onChange={e => updateLine(i, "expiry", e.target.value)} disabled={!line.rmCode} />
                    </div>
                    <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                      <input type="number" className="w-[60px] px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.qty || ""} onChange={e => updateLine(i, "qty", parseFloat(e.target.value) || 0)} disabled={!line.rmCode} />
                      {line.uom && <span className="text-[10px] text-muted-foreground">{line.uom}</span>}
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.rate} onChange={e => updateLine(i, "rate", e.target.value)} disabled={!line.rmCode} />
                    </div>
                    <div className="font-medium text-xs">
                      {line.qty && line.rate ? `₹${(line.qty * parseFloat(line.rate)).toLocaleString()}` : "—"}
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      {line.rmCode && (
                        <button onClick={() => removeLine(i)} className="p-1 rounded hover:bg-destructive/10">
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filledLines.length > 0 && (
                  <div className="flex justify-end gap-4 pt-2.5 border-t border-border mt-1">
                    <span className="text-[11px] text-muted-foreground">Invoice total</span>
                    <span className="text-[13px] font-medium">₹ {invoiceTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* QC Specs panel */}
            {selectedRM && selectedRM.qcSpecs.length > 0 && (
              <div className="app-card mt-2.5">
                <div className="app-card-head"><div className="app-card-title">QC specs — {selectedRM.name}</div></div>
                <div className="p-3.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedRM.qcSpecs.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 px-2 rounded bg-secondary">
                        <span className="text-muted-foreground">{s.parameter}</span>
                        <span className="font-medium">{s.spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {filledLines.length > 0 && (
              <div className="alert-strip alert-strip-info mt-1">
                Click a line item to view its QC specifications. Submit for QC when ready — stock will update only after QC approval.
              </div>
            )}
          </>
        )}

        {/* STEP: QC Sampling */}
        {step === "qc" && currentGRN && (
          <>
            {/* GRN Summary stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              <div className="bg-secondary rounded-md p-2.5">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">GRN no.</div>
                <div className="text-sm font-medium font-mono">{grnNo}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Supplier: {currentGRN.supplier}</div>
              </div>
              <div className="bg-secondary rounded-md p-2.5">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">RM items</div>
                <div className="text-lg font-medium">{currentGRN.lines.length}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{currentGRN.lines.map(l => l.rmName).join(" · ")}</div>
              </div>
              <div className="bg-secondary rounded-md p-2.5">
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">QC status</div>
                <div className="text-sm">
                  {currentGRN.lines.some(l => l.qcStatus === "in_test")
                    ? <span className="app-badge-amber text-[10px]">In progress</span>
                    : currentGRN.lines.every(l => l.qcStatus === "pending")
                    ? <span className="app-badge-gray text-[10px]">Pending</span>
                    : <span className="app-badge-green text-[10px]">Complete</span>}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">AR nos. assigned</div>
              </div>
            </div>

            <div className="alert-strip alert-strip-info mb-3 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Tests shown are auto-loaded from RM master. Parameters and acceptance criteria follow API / Ayurvedic Pharmacopoeia of India standards.</span>
            </div>

            {/* RM Tabs */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {currentGRN.lines.map((line, i) => {
                const isActive = activeRMTab === i;
                const dotColor = line.qcStatus === "approved" ? "bg-emerald-500" :
                  line.qcStatus === "rejected" ? "bg-destructive" :
                  line.qcStatus === "in_test" ? "bg-amber-500" : "bg-muted-foreground";
                const statusLabel = line.qcStatus === "in_test" ? "In test" :
                  line.qcStatus === "approved" ? "Approved" :
                  line.qcStatus === "rejected" ? "Rejected" : "Pending";
                const statusBadge = line.qcStatus === "in_test" ? "app-badge-amber" :
                  line.qcStatus === "approved" ? "app-badge-green" :
                  line.qcStatus === "rejected" ? "app-badge-red" : "app-badge-gray";
                return (
                  <button key={i} onClick={() => setActiveRMTab(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                      isActive ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {line.rmName} {line.part ? `(${line.part})` : ""}
                    <span className={`${statusBadge} text-[9px] px-1.5 py-px`}>{statusLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Active RM Panel */}
            {activeLine && (
              <>
                {/* Sample Identity */}
                <div className="app-card mb-2.5">
                  <div className="app-card-head">
                    <div className="app-card-title">Sample identity</div>
                    <span className="app-badge-green text-[10px]">{activeLine.category} · {activeLine.part}</span>
                  </div>
                  <div className="p-3.5">
                    <div className="grid grid-cols-4 gap-2.5 mb-2.5">
                      <div className="form-field"><label>AR / control no.</label><input value={activeLine.arNo} readOnly className="bg-secondary" /></div>
                      <div className="form-field"><label>RM name</label><input value={activeLine.rmName} readOnly className="bg-secondary" /></div>
                      <div className="form-field"><label>Botanical name</label><input value={activeLine.botanical} readOnly className="bg-secondary" /></div>
                      <div className="form-field"><label>Supplier batch no.</label><input value={activeLine.batch} readOnly className="bg-secondary" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 mb-2.5">
                      <div className="form-field"><label>Qty received</label><input value={`${activeLine.qty.toFixed(3)} ${activeLine.uom}`} readOnly className="bg-secondary" /></div>
                      <div className="form-field">
                        <label>Sample qty drawn</label>
                        <input type="number" step="0.001" value={activeLine.sampleQty}
                          onChange={e => updateQCLineField(grnNo, activeRMTab, { sampleQty: e.target.value })} />
                      </div>
                      <div className="form-field">
                        <label>Sample drawn by</label>
                        <input value={activeLine.sampleDrawnBy}
                          onChange={e => updateQCLineField(grnNo, activeRMTab, { sampleDrawnBy: e.target.value })} />
                      </div>
                      <div className="form-field">
                        <label>Sample drawn on</label>
                        <input type="date" value={activeLine.sampleDrawnOn}
                          onChange={e => updateQCLineField(grnNo, activeRMTab, { sampleDrawnOn: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="form-field"><label>Mfg. date (supplier)</label><input readOnly className="bg-secondary" value="—" /></div>
                      <div className="form-field"><label>Expiry date</label><input value={activeLine.expiry} readOnly className="bg-secondary" /></div>
                      <div className="form-field"><label>Storage (supplier label)</label><input readOnly className="bg-secondary" value="As per label" /></div>
                    </div>
                  </div>
                </div>

                {/* Test Sections */}
                {sections.map(section => {
                  const meta = SECTION_META[section] || { label: section, badge: "", badgeClass: "app-badge-gray" };
                  const sectionResults = activeQCResults
                    .map((r, idx) => ({ ...r, _idx: idx }))
                    .filter(r => r.section === section);

                  return (
                    <div key={section} className="app-card mb-2.5">
                      <div className="app-card-head">
                        <div className="app-card-title">{meta.label}</div>
                        <span className={`${meta.badgeClass} text-[10px]`}>{meta.badge}</span>
                      </div>
                      <div className="p-3.5">
                        {/* Header row */}
                        <div className="grid grid-cols-[2fr_1.2fr_1.2fr_1.5fr_90px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                          <div>Parameter</div>
                          <div>{section === "Organoleptic" ? "Acceptance criteria (API)" : "Limit (API / WHO)"}</div>
                          <div>{section === "Organoleptic" ? "Observed value" : "Measured value"}</div>
                          <div>{section === "Organoleptic" ? "Result" : "Unit"}</div>
                          <div>Pass / Fail</div>
                        </div>

                        {sectionResults.map(result => (
                          <div key={result._idx} className="grid grid-cols-[2fr_1.2fr_1.2fr_1.5fr_90px] gap-2 py-2 items-center border-b border-border last:border-b-0 text-xs">
                            <div className="font-medium">{result.parameter}</div>
                            <div className="text-muted-foreground">{result.spec}</div>
                            <div>
                              <input
                                className="w-full px-2 py-1 border border-border rounded-md text-[11px] focus:outline-none focus:border-primary"
                                placeholder="Enter result…"
                                value={result.actual}
                                onChange={e => updateQCResult(grnNo, activeRMTab, result._idx, e.target.value, result.pass)}
                              />
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              {section === "Organoleptic"
                                ? (result.pass === true ? "Within range" : result.pass === false ? "Out of range" : "—")
                                : result.unit || "—"}
                            </div>
                            <div>
                              <select
                                className={`w-[80px] px-2 py-1 border rounded-md text-[11px] font-medium transition-all ${
                                  result.pass === true ? "border-primary bg-primary/10 text-primary" :
                                  result.pass === false ? "border-destructive bg-destructive/10 text-destructive" :
                                  "border-border"
                                }`}
                                value={result.pass === true ? "pass" : result.pass === false ? "fail" : ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  updateQCResult(grnNo, activeRMTab, result._idx, result.actual, val === "pass" ? true : val === "fail" ? false : null);
                                }}
                              >
                                <option value="">—</option>
                                <option value="pass">Pass</option>
                                <option value="fail">Fail</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Test Summary & Overall Result */}
                <div className="app-card mb-2.5">
                  <div className="app-card-head"><div className="app-card-title">E. Test summary & overall result</div></div>
                  <div className="p-3.5">
                    {/* Counter cards */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-secondary rounded-md p-2.5 text-center">
                        <div className="text-[10px] text-muted-foreground mb-0.5">Total tests</div>
                        <div className="text-xl font-medium">{totalTests}</div>
                      </div>
                      <div className="rounded-md p-2.5 text-center" style={{ background: "hsl(var(--success) / 0.1)" }}>
                        <div className="text-[10px] mb-0.5" style={{ color: "hsl(var(--success))" }}>Pass</div>
                        <div className="text-xl font-medium" style={{ color: "hsl(var(--success))" }}>{passCount}</div>
                      </div>
                      <div className="rounded-md p-2.5 text-center" style={{ background: "hsl(var(--destructive) / 0.1)" }}>
                        <div className="text-[10px] mb-0.5" style={{ color: "hsl(var(--destructive))" }}>Fail</div>
                        <div className="text-xl font-medium" style={{ color: "hsl(var(--destructive))" }}>{failCount}</div>
                      </div>
                      <div className="bg-secondary rounded-md p-2.5 text-center">
                        <div className="text-[10px] text-muted-foreground mb-0.5">Pending</div>
                        <div className="text-xl font-medium">{pendingCount}</div>
                      </div>
                    </div>

                    {/* Overall result banner */}
                    <div className={`rounded-md p-3 flex items-center gap-3 mb-3 border ${
                      overallStatus === "pass" ? "border-primary/40 bg-primary/5" :
                      overallStatus === "fail" ? "border-destructive/40 bg-destructive/5" :
                      "border-border bg-secondary"
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        overallStatus === "pass" ? "bg-primary" :
                        overallStatus === "fail" ? "bg-destructive" : "bg-border"
                      }`}>
                        {overallStatus === "pass" && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                        {overallStatus === "fail" && <XCircle className="w-4 h-4 text-destructive-foreground" />}
                        {overallStatus === "pending" && <AlertCircle className="w-4 h-4 text-background" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium">
                          {overallStatus === "pass" && "All tests passed — material is of standard quality"}
                          {overallStatus === "fail" && `${failCount} test(s) failed — material not of standard quality`}
                          {overallStatus === "pending" && `${pendingCount} test(s) still pending — result not yet determinable`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {overallStatus === "pass" && "Eligible for approval and release to store"}
                          {overallStatus === "fail" && "Review failed parameters and select disposition below"}
                          {overallStatus === "pending" && "Complete all test entries to determine overall result"}
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        overallStatus === "pass" ? "app-badge-green" :
                        overallStatus === "fail" ? "app-badge-red" : "app-badge-amber"
                      }`}>
                        {overallStatus === "pass" ? "Standard quality" : overallStatus === "fail" ? "Not of standard quality" : "Incomplete"}
                      </span>
                    </div>

                    {/* AR details */}
                    <div className="section-divider">Analytical report details</div>
                    <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                      <div className="form-field"><label>AR report number</label><input value={activeLine.arNo} readOnly className="bg-secondary" /></div>
                      <div className="form-field"><label>Date of analysis</label><input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
                      <div className="form-field"><label>Report valid until</label><input type="date" /></div>
                    </div>
                    <div className="form-field mb-2.5">
                      <label>Analyst remarks</label>
                      <textarea
                        value={activeLine.analystRemarks}
                        onChange={e => updateQCLineField(grnNo, activeRMTab, { analystRemarks: e.target.value })}
                        placeholder="Enter observations, compliance notes, and recommendations…"
                      />
                    </div>

                    {/* Signatures */}
                    <div className="section-divider">Signatures</div>
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div
                        className="border border-border rounded-md p-2.5 flex items-center gap-2.5 bg-secondary cursor-pointer hover:border-primary transition-all"
                        onClick={() => {
                          if (!activeLine.analystSigned) {
                            updateQCLineField(grnNo, activeRMTab, {
                              analystSigned: true,
                              analystSignedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                            });
                          }
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[11px] font-medium flex items-center justify-center shrink-0">QA</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">QC Analyst</div>
                          <div className="text-[10px] text-muted-foreground">Analyst</div>
                          {activeLine.analystSigned ? (
                            <div className="text-[10px] font-medium mt-0.5" style={{ color: "hsl(var(--success))" }}>✓ Signed — {activeLine.analystSignedAt}</div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground mt-0.5">Click to sign</div>
                          )}
                        </div>
                      </div>
                      <div className="border border-border rounded-md p-2.5 flex items-center gap-2.5 bg-secondary">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 text-[11px] font-medium flex items-center justify-center shrink-0">AQ</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">Approved QC Analyst</div>
                          <div className="text-[10px] text-muted-foreground">Countersignature</div>
                          {activeLine.approverSigned ? (
                            <div className="text-[10px] font-medium mt-0.5" style={{ color: "hsl(var(--success))" }}>✓ Countersigned — {activeLine.approverSignedAt}</div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground mt-0.5">Pending countersignature</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Disposition */}
                    <div className="section-divider">Disposition decision</div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={() => updateQCLineField(grnNo, activeRMTab, { disposition: "approve" })}
                        className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                          activeLine.disposition === "approve" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <CheckCircle2 className={`w-6 h-6 mx-auto mb-1 ${activeLine.disposition === "approve" ? "text-primary" : "text-muted-foreground"}`} />
                        <div className={`text-xs font-medium ${activeLine.disposition === "approve" ? "text-primary" : ""}`}>Approve</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Release to store, update stock</div>
                      </button>
                      <button
                        onClick={() => updateQCLineField(grnNo, activeRMTab, { disposition: "retest" })}
                        className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                          activeLine.disposition === "retest" ? "border-amber-500 bg-amber-500/5" : "border-border hover:border-amber-500/40"
                        }`}
                      >
                        <RotateCcw className={`w-6 h-6 mx-auto mb-1 ${activeLine.disposition === "retest" ? "text-amber-600" : "text-muted-foreground"}`} />
                        <div className={`text-xs font-medium ${activeLine.disposition === "retest" ? "text-amber-600" : ""}`}>Retest</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Hold, repeat specific tests</div>
                      </button>
                      <button
                        onClick={() => updateQCLineField(grnNo, activeRMTab, { disposition: "reject" })}
                        className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                          activeLine.disposition === "reject" ? "border-destructive bg-destructive/5" : "border-border hover:border-destructive/40"
                        }`}
                      >
                        <XCircle className={`w-6 h-6 mx-auto mb-1 ${activeLine.disposition === "reject" ? "text-destructive" : "text-muted-foreground"}`} />
                        <div className={`text-xs font-medium ${activeLine.disposition === "reject" ? "text-destructive" : ""}`}>Reject</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Return to supplier</div>
                      </button>
                    </div>

                    {/* Reason textarea for reject/retest */}
                    {(activeLine.disposition === "reject" || activeLine.disposition === "retest") && (
                      <div className="form-field mt-2.5">
                        <label>{activeLine.disposition === "reject" ? "Rejection reason" : "Retest reason"}</label>
                        <textarea
                          placeholder="State specific failing parameters and action to be taken…"
                          value={activeLine.dispositionReason}
                          onChange={e => updateQCLineField(grnNo, activeRMTab, { dispositionReason: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* STEP: Done */}
        {step === "done" && currentGRN && (
          <div className="space-y-3">
            <div className="alert-strip alert-strip-info flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>GRN {grnNo} — QC complete. Stock ledger updated for {currentGRN.lines.filter(l => l.qcStatus === "approved").length} approved item(s).</span>
            </div>

            {currentGRN.lines.map((line, i) => (
              <div key={i} className="app-card">
                <div className="app-card-head flex items-center justify-between">
                  <div className="app-card-title">{line.rmName}</div>
                  {line.qcStatus === "approved" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <CheckCircle2 className="w-3 h-3" /> Approved — +{line.qty} {line.uom} added to ledger
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      <ShieldX className="w-3 h-3" /> {line.disposition === "retest" ? "Held for retest" : "Rejected — not added"}
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="grid grid-cols-[2fr_1.2fr_1.2fr_90px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                    <div>Parameter</div><div>Spec</div><div>Actual</div><div>Result</div>
                  </div>
                  {line.qcResults.map((r, j) => (
                    <div key={j} className="grid grid-cols-[2fr_1.2fr_1.2fr_90px] gap-2 py-1.5 items-center border-b border-border last:border-b-0 text-xs">
                      <div>{r.parameter}</div>
                      <div className="text-muted-foreground">{r.spec}</div>
                      <div className="font-medium">{r.actual || "—"}</div>
                      <div>
                        {r.pass === true ? (
                          <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pass</span>
                        ) : r.pass === false ? (
                          <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Fail</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={() => navigate("/")} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RMInward;
