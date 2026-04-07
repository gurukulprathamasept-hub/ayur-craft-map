import { BMRRecord } from "@/context/BMRContext";
import { Info } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const Step5YieldPacking = ({ bmr, onChange }: Props) => {
  const yieldPct = bmr.theoreticalYield > 0 && bmr.actualYield > 0
    ? (bmr.actualYield / bmr.theoreticalYield * 100) : 0;
  const loss = bmr.theoreticalYield - bmr.actualYield;
  const barColor = yieldPct >= 95 ? "bg-primary" : yieldPct >= 85 ? "bg-[hsl(var(--warning))]" : "bg-destructive";

  const updatePacking = (key: string, value: string | number) =>
    onChange({ packing: { ...bmr.packing, [key]: value } });
  const updateLabel = (key: string, value: string | boolean) =>
    onChange({ label: { ...bmr.label, [key]: value } });
  const updateWarehouse = (key: string, value: string) =>
    onChange({ warehouseTransfer: { ...bmr.warehouseTransfer, [key]: value } });

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.18 & 22: Theoretical yield and actual production yield, packing particulars, date of release, quantity released for sale and distribution.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Yield calculation</div>
          <span className="app-badge app-badge-gray">§I-A.18</span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-4 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>Theoretical yield ({bmr.batchUnit})</label>
              <input value={bmr.theoreticalYield} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Actual production yield ({bmr.batchUnit})</label>
              <input type="number" step="0.001" value={bmr.actualYield || ""}
                onChange={e => onChange({ actualYield: Number(e.target.value), yieldPct: bmr.theoreticalYield ? Number(e.target.value) / bmr.theoreticalYield * 100 : 0 })} />
            </div>
            <div className="form-field">
              <label>Yield % (auto)</label>
              <input value={yieldPct ? yieldPct.toFixed(1) + "%" : "—"} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Loss ({bmr.batchUnit})</label>
              <input value={loss > 0 ? loss.toFixed(3) : "—"} readOnly className="bg-secondary" />
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Yield progress</div>
            <div className="progress-bar-track">
              <div className={`h-full rounded-sm transition-all ${barColor}`} style={{ width: `${Math.min(100, yieldPct)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span><span>Target ≥95%</span><span>100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Packing details</div>
          <span className="app-badge app-badge-gray">§I-A.18 & 19</span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-4 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>Primary pack size</label>
              <select value={bmr.packing.primaryPackSize} onChange={e => updatePacking("primaryPackSize", e.target.value)}>
                <option>100 g HDPE jar</option><option>200 g HDPE jar</option><option>500 g HDPE jar</option><option>1 kg pouch</option>
              </select>
            </div>
            <div className="form-field">
              <label>No. of primary packs</label>
              <input type="number" value={bmr.packing.noOfPrimaryPacks || ""} onChange={e => updatePacking("noOfPrimaryPacks", Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Total qty packed ({bmr.batchUnit})</label>
              <input value={bmr.packing.totalQtyPacked} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>QC retain sample (g)</label>
              <input value={bmr.packing.qcRetainSample} onChange={e => updatePacking("qcRetainSample", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="form-field">
              <label>Secondary pack</label>
              <input value={bmr.packing.secondaryPack} onChange={e => updatePacking("secondaryPack", e.target.value)} />
            </div>
            <div className="form-field">
              <label>No. of shippers</label>
              <input type="number" value={bmr.packing.noOfShippers || ""} onChange={e => updatePacking("noOfShippers", Number(e.target.value))} />
            </div>
            <div className="form-field">
              <label>Labelling / batch code</label>
              <input value={bmr.packing.labellingBatchCode} onChange={e => updatePacking("labellingBatchCode", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Packing done on</label>
              <input type="date" value={bmr.packing.packingDate} onChange={e => updatePacking("packingDate", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Label specimen verification</div>
          <span className="app-badge app-badge-gray">§I-A.19</span>
        </div>
        <div className="p-3.5">
          <div className="bg-secondary rounded-md p-3 mb-2.5 border border-border">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Label preview</div>
            <div className="flex gap-5 flex-wrap text-xs">
              <div><span className="text-muted-foreground">Product:</span> <strong>{bmr.productName}</strong></div>
              <div><span className="text-muted-foreground">Batch no.:</span> <strong>{bmr.batchNo}</strong></div>
              <div><span className="text-muted-foreground">Mfg. date:</span> <strong>{bmr.startDate}</strong></div>
              <div><span className="text-muted-foreground">Exp. date:</span> <strong>{bmr.expiryDate || "—"}</strong></div>
              <div><span className="text-muted-foreground">MRP:</span> <strong>₹ <input className="form-input-sm w-14 inline" value={bmr.label.mrp} onChange={e => updateLabel("mrp", e.target.value)} /></strong></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="form-field"><label>Label approved by</label><input value={bmr.label.approvedBy} onChange={e => updateLabel("approvedBy", e.target.value)} /></div>
            <div className="form-field"><label>Approval date</label><input type="date" value={bmr.label.approvalDate} onChange={e => updateLabel("approvalDate", e.target.value)} /></div>
            <div className="form-field">
              <label>Label batch code verified</label>
              <select value={bmr.label.batchCodeVerified ? "yes" : "no"} onChange={e => updateLabel("batchCodeVerified", e.target.value === "yes")}>
                <option value="yes">Yes — matches BMR</option><option value="no">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Warehouse transfer</div>
          <span className="app-badge app-badge-gray">§I-A.23</span>
        </div>
        <div className="p-3.5 grid grid-cols-4 gap-2.5">
          <div className="form-field"><label>Qty to warehouse ({bmr.batchUnit})</label><input value={bmr.warehouseTransfer.qtyToWarehouse} onChange={e => updateWarehouse("qtyToWarehouse", e.target.value)} /></div>
          <div className="form-field"><label>Warehouse location</label><input value={bmr.warehouseTransfer.warehouseLocation} onChange={e => updateWarehouse("warehouseLocation", e.target.value)} /></div>
          <div className="form-field"><label>Transfer date</label><input type="date" value={bmr.warehouseTransfer.transferDate} onChange={e => updateWarehouse("transferDate", e.target.value)} /></div>
          <div className="form-field"><label>Transfer acknowledged by</label><input value={bmr.warehouseTransfer.transferAcknowledgedBy} onChange={e => updateWarehouse("transferAcknowledgedBy", e.target.value)} /></div>
        </div>
      </div>
    </>
  );
};

export default Step5YieldPacking;
