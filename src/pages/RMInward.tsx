import { useNavigate } from "react-router-dom";

const RMInward = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM inward — new GRN</div>
          <div className="text-[11px] text-muted-foreground mt-px">GRN-2025-0187 · Draft · Schedule U §II</div>
        </div>
        <button onClick={() => navigate("/")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
        <button className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Save draft</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Submit for QC</button>
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
            <div className="step-num step-num-current">2</div>
            <span className="text-foreground font-medium">Line items</span>
          </div>
          <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />
          <div className="flex items-center gap-1.5 text-[11px]">
            <div className="step-num step-num-todo">3</div>
            <span className="text-muted-foreground">QC sampling</span>
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
            {/* Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>RM name</div><div>Batch no.</div><div>Expiry</div><div>Qty recd.</div><div>Unit rate (₹)</div><div>Value (₹)</div>
            </div>
            {/* Row 1 */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 py-1.5 items-center border-b border-border">
              <div>
                <div className="font-medium text-xs">Ashwagandha root</div>
                <div className="text-[10px] text-muted-foreground">AR/2025-187-01 · Withania somnifera</div>
              </div>
              <div><input className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue="HHT-ASH-2204" /></div>
              <div><input type="date" className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue="2027-06-01" /></div>
              <div className="flex gap-1 items-center">
                <input type="number" className="w-[60px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={5} />
                <span className="text-[10px] text-muted-foreground">kg</span>
              </div>
              <div><input type="number" className="w-[70px] px-2 py-1 border-primary border rounded-md text-[11px]" defaultValue={480} /></div>
              <div className="font-medium text-kpi-ok">2,400</div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-2 py-1.5 items-center">
              <div>
                <div className="font-medium text-xs">Pippali fruit</div>
                <div className="text-[10px] text-muted-foreground">AR/2025-187-02 · Piper longum</div>
              </div>
              <div><input className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue="HHT-PIP-2206" /></div>
              <div><input type="date" className="w-full px-2 py-1 border border-border rounded-md text-[11px]" defaultValue="2026-12-31" /></div>
              <div className="flex gap-1 items-center">
                <input type="number" className="w-[60px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={3} />
                <span className="text-[10px] text-muted-foreground">kg</span>
              </div>
              <div><input type="number" className="w-[70px] px-2 py-1 border-primary border rounded-md text-[11px]" defaultValue={1200} /></div>
              <div className="font-medium text-kpi-ok">3,600</div>
            </div>
            {/* Total */}
            <div className="flex justify-end gap-4 pt-2.5 border-t border-border mt-1">
              <span className="text-[11px] text-muted-foreground">Invoice total</span>
              <span className="text-[13px] font-medium">₹ 6,000</span>
            </div>
          </div>
        </div>

        <div className="alert-strip alert-strip-info mt-1">
          Rate update: Ashwagandha unit rate will update from ₹450 → ₹480/kg after approval. Dashboard and valuation will reflect immediately.
        </div>
      </div>
    </>
  );
};

export default RMInward;
