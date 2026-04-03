import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/context/StockContext";
import { useSupplier } from "@/context/SupplierContext";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Search, ChevronDown } from "lucide-react";

type InwardLine = {
  rmCode: string;
  rmName: string;
  botanical: string;
  uom: string;
  batch: string;
  expiry: string;
  qty: number;
  rate: string;
};

const RMInward = () => {
  const navigate = useNavigate();
  const { rmData, inwardStock } = useStock();
  const [submitted, setSubmitted] = useState(false);
  const [lines, setLines] = useState<InwardLine[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedLineIdx, setSelectedLineIdx] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const filteredRM = rmData.filter(rm => {
    if (!pickerSearch) return true;
    const s = pickerSearch.toLowerCase();
    return rm.name.toLowerCase().includes(s) || rm.botanical.toLowerCase().includes(s) || rm.code.toLowerCase().includes(s);
  });

  const addLine = (rmCode: string) => {
    const rm = rmData.find(r => r.code === rmCode);
    if (!rm) return;
    setLines(prev => [...prev, {
      rmCode: rm.code, rmName: rm.name, botanical: rm.botanical, uom: rm.uom,
      batch: "", expiry: "", qty: 0, rate: "",
    }]);
    setShowPicker(false);
    setPickerSearch("");
  };

  const removeLine = (i: number) => {
    setLines(prev => prev.filter((_, idx) => idx !== i));
    if (selectedLineIdx === i) setSelectedLineIdx(null);
  };

  const updateLine = (i: number, field: keyof InwardLine, val: string | number) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
  };

  const handleSubmit = () => {
    if (lines.length === 0) {
      toast({ title: "No line items", description: "Add at least one RM.", variant: "destructive" });
      return;
    }
    const validLines = lines.filter(l => l.qty > 0);
    if (validLines.length === 0) {
      toast({ title: "Invalid quantities", description: "Enter qty > 0.", variant: "destructive" });
      return;
    }
    inwardStock(
      "GRN-2025-0187",
      validLines.map(l => ({ rmName: l.rmName, qty: l.qty, batch: l.batch, expiry: l.expiry, rate: l.rate }))
    );
    setSubmitted(true);
    toast({ title: "GRN submitted", description: "Stock ledger updated. Pending QC sampling." });
  };

  const invoiceTotal = lines.reduce((s, l) => s + l.qty * (parseFloat(l.rate) || 0), 0);

  const selectedRM = selectedLineIdx !== null ? rmData.find(r => r.code === lines[selectedLineIdx]?.rmCode) : null;

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM inward — new GRN</div>
          <div className="text-[11px] text-muted-foreground mt-px">GRN-2025-0187 · {submitted ? "Submitted" : "Draft"} · Schedule U §II</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save draft</button>
        <button onClick={handleSubmit} disabled={submitted}
          className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50">
          {submitted ? "✓ Submitted" : "Submit for QC"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-4">
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="step-num step-num-done">1</div>
            <span className="text-muted-foreground">Header</span>
          </div>
          <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className={`step-num ${submitted ? "step-num-done" : "step-num-current"}`}>2</div>
            <span className={submitted ? "text-muted-foreground" : "text-foreground font-medium"}>Line items</span>
          </div>
          <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className={`step-num ${submitted ? "step-num-current" : "step-num-todo"}`}>3</div>
            <span className={submitted ? "text-foreground font-medium" : "text-muted-foreground"}>QC sampling</span>
          </div>
          <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="step-num step-num-todo">4</div>
            <span className="text-muted-foreground">Approve</span>
          </div>
        </div>

        {/* Receipt header */}
        <div className="app-card mb-2.5">
          <div className="app-card-head"><div className="app-card-title">Receipt header</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-field"><label>GRN number</label><input value="GRN-2025-0187" disabled className="bg-secondary" /></div>
              <div className="form-field"><label>GRN date</label><input type="date" defaultValue="2025-06-14" /></div>
              <div className="form-field"><label>Supplier</label><select><option>Himalaya Herbs Traders, Dehradun</option></select></div>
              <div className="form-field"><label>Invoice / challan no.</label><input defaultValue="HHT/2025/4421" /></div>
              <div className="form-field"><label>Invoice date</label><input type="date" defaultValue="2025-06-12" /></div>
              <div className="form-field">
                <label>Source type</label>
                <select>
                  <option>Trader</option><option>Manufacturer</option><option>Forest Collector</option>
                  <option>Cultivator</option><option>Importer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">Line items ({lines.length})</div>
            {!submitted && (
              <div className="relative" ref={pickerRef}>
                <button onClick={() => setShowPicker(!showPicker)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-all">
                  <Plus className="w-3 h-3" /> Add RM <ChevronDown className="w-3 h-3" />
                </button>
                {showPicker && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-background border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <input type="search" placeholder="Search RM…" value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 border border-border rounded-md text-xs" autoFocus />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {filteredRM.map(rm => (
                        <button key={rm.code} onClick={() => addLine(rm.code)}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-secondary text-xs">
                          <div className="font-medium">{rm.name}</div>
                          <div className="text-[10px] text-muted-foreground">{rm.code} · {rm.botanical} · {rm.uom}</div>
                        </button>
                      ))}
                      {filteredRM.length === 0 && <div className="text-center py-3 text-xs text-muted-foreground">No RM found</div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3.5">
            {lines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No line items yet. Click "+ Add RM" to pick materials from the master list.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_32px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
                  <div>RM name</div><div>Batch no.</div><div>Expiry</div><div>Qty recd.</div><div>Unit rate (₹)</div><div>Value (₹)</div><div></div>
                </div>
                {lines.map((line, i) => (
                  <div key={i}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px_32px] gap-2 py-1.5 items-center border-b border-border last:border-b-0 cursor-pointer ${selectedLineIdx === i ? "bg-secondary/50 rounded" : ""}`}
                    onClick={() => setSelectedLineIdx(selectedLineIdx === i ? null : i)}>
                    <div>
                      <div className="font-medium text-xs">{line.rmName}</div>
                      <div className="text-[10px] text-muted-foreground">{line.rmCode} · {line.botanical}</div>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <input className="w-full px-2 py-1 border border-border rounded-md text-[11px]" placeholder="Batch"
                        value={line.batch} onChange={e => updateLine(i, "batch", e.target.value)} disabled={submitted} />
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <input type="date" className="w-full px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.expiry} onChange={e => updateLine(i, "expiry", e.target.value)} disabled={submitted} />
                    </div>
                    <div className="flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                      <input type="number" className="w-[60px] px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.qty || ""} onChange={e => updateLine(i, "qty", parseFloat(e.target.value) || 0)} disabled={submitted} />
                      <span className="text-[10px] text-muted-foreground">{line.uom}</span>
                    </div>
                    <div onClick={e => e.stopPropagation()}>
                      <input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]"
                        value={line.rate} onChange={e => updateLine(i, "rate", e.target.value)} disabled={submitted} />
                    </div>
                    <div className="font-medium text-xs">{line.qty && line.rate ? `₹${(line.qty * parseFloat(line.rate)).toLocaleString()}` : "—"}</div>
                    <div onClick={e => e.stopPropagation()}>
                      {!submitted && (
                        <button onClick={() => removeLine(i)} className="p-1 rounded hover:bg-destructive/10">
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-4 pt-2.5 border-t border-border mt-1">
                  <span className="text-[11px] text-muted-foreground">Invoice total</span>
                  <span className="text-[13px] font-medium">₹ {invoiceTotal.toLocaleString()}</span>
                </div>
              </>
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

        {submitted ? (
          <div className="alert-strip alert-strip-info mt-1">
            ✓ Stock ledger updated — {lines.filter(l => l.qty > 0).map(l => `${l.rmName} +${l.qty} ${l.uom}`).join(", ")}. Pending QC sampling.
          </div>
        ) : lines.length > 0 ? (
          <div className="alert-strip alert-strip-info mt-1">
            Click a line item to view its QC specifications from the RM master.
          </div>
        ) : null}
      </div>
    </>
  );
};

export default RMInward;
