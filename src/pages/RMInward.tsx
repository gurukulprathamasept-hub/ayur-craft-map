import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStock } from "@/context/StockContext";
import { toast } from "@/hooks/use-toast";

const RMInward = () => {
  const navigate = useNavigate();
  const { inwardStock } = useStock();
  const [submitted, setSubmitted] = useState(false);

  const [lines] = useState([
    { rmName: "Ashwagandha", batch: "AR/2025-187-01", expiry: "Jun 2027", qty: 5, rate: "480", unit: "kg" },
    { rmName: "Pippali", batch: "AR/2025-187-02", expiry: "Dec 2026", qty: 3, rate: "1200", unit: "kg" },
  ]);

  const handleSubmit = () => {
    inwardStock(
      "GRN-2025-0187",
      lines.map(l => ({
        rmName: l.rmName,
        qty: l.qty,
        batch: l.batch,
        expiry: l.expiry,
        rate: l.rate,
      }))
    );
    setSubmitted(true);
    toast({ title: "GRN submitted", description: "Stock ledger updated. Pending QC sampling." });
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM inward — new GRN</div>
          <div className="text-[11px] text-muted-foreground mt-px">GRN-2025-0187 · {submitted ? "Submitted" : "Draft"} · Schedule U §II</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save draft</button>
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
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
              <div className="form-field">
                <label>GRN number</label>
                <input value="GRN-2025-0187" disabled className="bg-secondary" />
              </div>
              <div className="form-field">
                <label>GRN date</label>
                <input type="date" defaultValue="2025-06-14" />
              </div>
              <div className="form-field">
                <label>Supplier</label>
                <select><option>Himalaya Herbs Traders, Dehradun</option></select>
              </div>
              <div className="form-field">
                <label>Invoice / challan no.</label>
                <input defaultValue="HHT/2025/4421" />
              </div>
              <div className="form-field">
                <label>Invoice date</label>
                <input type="date" defaultValue="2025-06-12" />
              </div>
              <div className="form-field">
                <label>Source type</label>
                <select>
                  <option>Trader</option>
                  <option>Manufacturer</option>
                  <option>Forest Collector</option>
                  <option>Cultivator</option>
                  <option>Importer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">Line items</div>
            <button className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:opacity-90 transition-all">+ Add RM</button>
          </div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>RM name</div><div>Batch no.</div><div>Expiry</div><div>Qty recd.</div><div>Unit rate (₹)</div><div>Value (₹)</div>
            </div>
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 py-1.5 items-center border-b border-border last:border-b-0">
                <div>
                  <div className="font-medium text-xs">{line.rmName}{i === 0 ? " root" : " fruit"}</div>
                  <div className="text-[10px] text-muted-foreground">{line.batch} · {i === 0 ? "Withania somnifera" : "Piper longum"}</div>
                </div>
                <div><input className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={i === 0 ? "HHT-ASH-2204" : "HHT-PIP-2206"} /></div>
                <div><input type="date" className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={i === 0 ? "2027-06-01" : "2026-12-31"} /></div>
                <div className="flex gap-1 items-center">
                  <input type="number" className="w-[60px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={line.qty} />
                  <span className="text-[10px] text-muted-foreground">{line.unit}</span>
                </div>
                <div><input type="number" className="w-[70px] px-2 py-1 border-primary border rounded-md text-[11px]" defaultValue={parseInt(line.rate)} /></div>
                <div className="font-medium text-kpi-ok">{(line.qty * parseInt(line.rate)).toLocaleString()}</div>
              </div>
            ))}
            <div className="flex justify-end gap-4 pt-2.5 border-t border-border mt-1">
              <span className="text-[11px] text-muted-foreground">Invoice total</span>
              <span className="text-[13px] font-medium">₹ {lines.reduce((s, l) => s + l.qty * parseInt(l.rate), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="alert-strip alert-strip-info mt-1">
            ✓ Stock ledger updated — Ashwagandha +5 kg, Pippali +3 kg. Pending QC sampling.
          </div>
        ) : (
          <div className="alert-strip alert-strip-info mt-1">
            Rate update: Ashwagandha unit rate will update from ₹450 → ₹480/kg after approval. Dashboard and valuation will reflect immediately.
          </div>
        )}
      </div>
    </>
  );
};

export default RMInward;
