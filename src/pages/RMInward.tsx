import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStock, type PendingGRN, type PendingGRNLine, type QCResult } from "@/context/StockContext";
import { useSupplier } from "@/context/SupplierContext";
import { toast } from "@/hooks/use-toast";
import { X, Search, CheckCircle2, XCircle, AlertCircle, FlaskConical, ShieldCheck, ShieldX } from "lucide-react";

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

const RMInward = () => {
  const navigate = useNavigate();
  const {
    rmData, getNextGRN, incrementGRN,
    submitForQC, updateQCResult, approveGRNLine, rejectGRNLine, finalApproveGRN, pendingGRNs,
  } = useStock();
  const { suppliers } = useSupplier();
  const [selectedSupplier, setSelectedSupplier] = useState("SUP-001");
  const [step, setStep] = useState<"entry" | "qc" | "done">("entry");
  const [lines, setLines] = useState<InwardLine[]>([emptyLine()]);
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null);

  const { nextGRN, prevGRN } = getNextGRN();
  const [grnNo, setGrnNo] = useState(nextGRN);
  const currentGRN = pendingGRNs.find(g => g.grnNo === grnNo);

  useEffect(() => { setGrnNo(nextGRN); }, [nextGRN]);

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

    // Build pending GRN with QC specs from RM master
    const pendingLines: PendingGRNLine[] = validLines.map(l => {
      const rm = rmData.find(r => r.code === l.rmCode);
      const qcResults: QCResult[] = (rm?.qcSpecs || []).map(s => ({
        parameter: s.parameter,
        spec: s.spec,
        actual: "",
        pass: null,
      }));
      return {
        rmCode: l.rmCode,
        rmName: l.rmName,
        qty: l.qty,
        batch: l.batch,
        expiry: l.expiry,
        rate: l.rate,
        uom: l.uom,
        qcResults,
        qcStatus: "pending",
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
    toast({ title: "Submitted for QC", description: "Complete QC sampling to update stock ledger." });
  };

  const handleApproveAll = () => {
    if (!currentGRN) return;
    // Check all lines have all params tested
    const allTested = currentGRN.lines.every(l =>
      l.qcResults.every(r => r.pass !== null)
    );
    if (!allTested) {
      toast({ title: "Incomplete QC", description: "Fill all test results before approval.", variant: "destructive" });
      return;
    }
    finalApproveGRN(grnNo);
    setStep("done");
    toast({ title: "GRN approved", description: "Stock ledger updated for approved items." });
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

  const stepNum = step === "entry" ? 2 : step === "qc" ? 3 : 4;

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM inward — new GRN</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {grnNo} · {step === "entry" ? "Draft" : step === "qc" ? "Pending QC" : "Approved"} · Schedule U §II
          </div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
        {step === "entry" && (
          <>
            <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save draft</button>
            <button onClick={handleSubmitForQC}
              className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              Submit for QC
            </button>
          </>
        )}
        {step === "qc" && (
          <button onClick={handleApproveAll}
            className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Final Approve & Update Stock
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-4">
          {[
            { n: 1, label: "Header" },
            { n: 2, label: "Line items" },
            { n: 3, label: "QC sampling" },
            { n: 4, label: "Approve" },
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
                  <div className="form-field"><label>GRN date</label><input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
                  <div className="form-field">
                    <label>Supplier</label>
                    <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
                      {suppliers.filter(s => s.active).map(s => (
                        <option key={s.id} value={s.id}>{s.name}, {s.city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field"><label>Invoice / challan no.</label><input placeholder="INV-XXXX" /></div>
                  <div className="form-field"><label>Invoice date</label><input type="date" /></div>
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
            <div className="alert-strip alert-strip-info mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              <span>QC Sampling — Record test results for each RM. Stock ledger will update only after final approval.</span>
            </div>

            {currentGRN.lines.map((line, lineIdx) => (
              <div key={lineIdx} className="app-card mb-3">
                <div className="app-card-head flex items-center justify-between">
                  <div className="app-card-title flex items-center gap-2">
                    <span>{line.rmName}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {line.rmCode} · Batch: {line.batch} · {line.qty} {line.uom}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {line.qcStatus === "approved" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {line.qcStatus === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                    {line.qcStatus === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-3.5">
                  {/* QC Results table */}
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                    <div>Parameter</div><div>Specification</div><div>Actual result</div><div>Pass / Fail</div>
                  </div>
                  {line.qcResults.map((result, paramIdx) => (
                    <div key={paramIdx} className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-2 py-2 items-center border-b border-border last:border-b-0">
                      <div className="text-xs font-medium">{result.parameter}</div>
                      <div className="text-xs text-muted-foreground">{result.spec}</div>
                      <div>
                        <input
                          className="w-full px-2 py-1 border border-border rounded-md text-[11px]"
                          placeholder="Enter result…"
                          value={result.actual}
                          onChange={e => updateQCResult(grnNo, lineIdx, paramIdx, e.target.value, result.pass ?? false)}
                          disabled={line.qcStatus !== "pending"}
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateQCResult(grnNo, lineIdx, paramIdx, result.actual, true)}
                          disabled={line.qcStatus !== "pending"}
                          className={`p-1 rounded transition-all ${result.pass === true ? "bg-emerald-500/20 text-emerald-600" : "hover:bg-secondary text-muted-foreground"}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateQCResult(grnNo, lineIdx, paramIdx, result.actual, false)}
                          disabled={line.qcStatus !== "pending"}
                          className={`p-1 rounded transition-all ${result.pass === false ? "bg-destructive/20 text-destructive" : "hover:bg-secondary text-muted-foreground"}`}>
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Line approve/reject buttons */}
                  {line.qcStatus === "pending" && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          const allTested = line.qcResults.every(r => r.pass !== null);
                          if (!allTested) {
                            toast({ title: "Incomplete", description: "Test all parameters first.", variant: "destructive" });
                            return;
                          }
                          approveGRNLine(grnNo, lineIdx);
                        }}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:opacity-90 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Approve RM
                      </button>
                      <button
                        onClick={() => rejectGRNLine(grnNo, lineIdx)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 flex items-center gap-1.5">
                        <XCircle className="w-3 h-3" /> Reject RM
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Summary */}
            {currentGRN.lines.every(l => l.qcStatus !== "pending") && (
              <div className="alert-strip alert-strip-info mt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  All items tested — {currentGRN.lines.filter(l => l.qcStatus === "approved").length} approved,{" "}
                  {currentGRN.lines.filter(l => l.qcStatus === "rejected").length} rejected.
                  Click "Final Approve & Update Stock" to update the ledger.
                </span>
              </div>
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Approved — +{line.qty} {line.uom} added to ledger
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                      <ShieldX className="w-3 h-3" /> Rejected — not added
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                    <div>Parameter</div><div>Spec</div><div>Actual</div><div>Result</div>
                  </div>
                  {line.qcResults.map((r, j) => (
                    <div key={j} className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-2 py-1.5 items-center border-b border-border last:border-b-0 text-xs">
                      <div>{r.parameter}</div>
                      <div className="text-muted-foreground">{r.spec}</div>
                      <div className="font-medium">{r.actual || "—"}</div>
                      <div>
                        {r.pass ? (
                          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Pass</span>
                        ) : (
                          <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Fail</span>
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
