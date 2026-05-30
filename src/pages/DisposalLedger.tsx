import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Trash2, Plus, ClipboardList, Flame, Recycle, RotateCcw, Package } from "lucide-react";
import { useBMRs, DisposalEntry } from "@/context/BMRContext";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

type Tab = "ledger" | "new";

const today = () => new Date().toISOString().slice(0, 10);

const METHOD_ICON: Record<DisposalEntry["disposalMethod"], typeof Flame> = {
  Incineration: Flame,
  "Returned to Supplier": RotateCcw,
  Reprocessing: Recycle,
  Other: Package,
};

const METHOD_BADGE: Record<DisposalEntry["disposalMethod"], string> = {
  Incineration: "app-badge-red",
  "Returned to Supplier": "app-badge-amber",
  Reprocessing: "app-badge-teal",
  Other: "app-badge-gray",
};

const ITEM_TYPE_BADGE: Record<DisposalEntry["itemType"], string> = {
  RM: "app-badge-teal",
  "Finished Batch": "app-badge-purple",
  Packaging: "app-badge-gray",
};

const emptyForm = (): Omit<DisposalEntry, "id"> => ({
  date: today(),
  itemType: "RM",
  itemName: "",
  batchNo: "",
  qty: "",
  unit: "kg",
  reason: "",
  disposalMethod: "Incineration",
  authorisedBy: "",
  witnessedBy: "",
  bmrRef: "",
  grnRef: "",
});

const DisposalLedger = () => {
  const { disposalEntries, addDisposalEntry } = useBMRs();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const prefillItemType = (params.get("itemType") as DisposalEntry["itemType"]) || null;
  const prefillItemName = params.get("itemName") || "";
  const prefillBatchNo = params.get("batchNo") || "";
  const prefillQty = params.get("qty") || "";
  const prefillUnit = params.get("unit") || "";
  const prefillReason = params.get("reason") || "";
  const prefillBmrRef = params.get("bmrRef") || "";
  const prefillGrnRef = params.get("grnRef") || "";
  const hasPrefill = !!(prefillItemName || prefillBatchNo || prefillBmrRef || prefillGrnRef);

  const [tab, setTab] = useState<Tab>(hasPrefill ? "new" : "ledger");
  const [form, setForm] = useState<Omit<DisposalEntry, "id">>(() => ({
    ...emptyForm(),
    itemType: prefillItemType || "RM",
    itemName: prefillItemName,
    batchNo: prefillBatchNo,
    qty: prefillQty,
    unit: prefillUnit || "kg",
    reason: prefillReason,
    bmrRef: prefillBmrRef,
    grnRef: prefillGrnRef,
  }));

  useEffect(() => {
    setForm((f) => ({ ...f, authorisedBy: f.authorisedBy || currentUser?.name || "" }));
  }, [currentUser]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.itemName || !form.batchNo || !form.qty) {
      toast.error("Item name, batch no., and quantity are required");
      return;
    }
    if (!form.authorisedBy) {
      toast.error("Authorising signatory is required");
      return;
    }
    const entry: DisposalEntry = { ...form, id: `disp_${Date.now()}` };
    addDisposalEntry(entry);
    toast.success(`Disposal logged for ${entry.itemName} (${entry.batchNo})`);
    setForm({ ...emptyForm(), authorisedBy: currentUser?.name || "" });
    if (hasPrefill) setParams({});
    setTab("ledger");
  };

  const sorted = useMemo(
    () => [...disposalEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [disposalEntries]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          <h1 className="text-base font-semibold">Disposal Ledger</h1>
          <span className="text-xs text-muted-foreground ml-2">
            Schedule U — Rejection & Disposal Record
          </span>
        </div>
        <div className="mt-3 inline-flex rounded-md border border-border overflow-hidden bg-card">
          <button
            type="button"
            onClick={() => setTab("ledger")}
            className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
              tab === "ledger"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <ClipboardList className="w-3 h-3" /> Ledger ({disposalEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("new")}
            className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
              tab === "new"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Plus className="w-3 h-3" /> Log new disposal
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {tab === "ledger" && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title">All disposal entries</div>
            </div>
            <div className="p-3">
              {sorted.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  No disposals logged yet.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="text-left py-2 px-2 font-medium">Date</th>
                      <th className="text-left py-2 px-2 font-medium">Type</th>
                      <th className="text-left py-2 px-2 font-medium">Item</th>
                      <th className="text-left py-2 px-2 font-medium">Batch</th>
                      <th className="text-left py-2 px-2 font-medium">Qty</th>
                      <th className="text-left py-2 px-2 font-medium">Method</th>
                      <th className="text-left py-2 px-2 font-medium">Reason</th>
                      <th className="text-left py-2 px-2 font-medium">Authorised by</th>
                      <th className="text-left py-2 px-2 font-medium">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((e) => {
                      const Icon = METHOD_ICON[e.disposalMethod];
                      return (
                        <tr key={e.id} className="border-b border-border last:border-b-0">
                          <td className="py-2 px-2 text-muted-foreground">{e.date}</td>
                          <td className="py-2 px-2">
                            <span className={ITEM_TYPE_BADGE[e.itemType]}>{e.itemType}</span>
                          </td>
                          <td className="py-2 px-2 font-medium">{e.itemName}</td>
                          <td className="py-2 px-2 font-mono">{e.batchNo}</td>
                          <td className="py-2 px-2">
                            {e.qty} {e.unit}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`${METHOD_BADGE[e.disposalMethod]} inline-flex items-center gap-1`}>
                              <Icon className="w-3 h-3" /> {e.disposalMethod}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-muted-foreground max-w-[180px] truncate" title={e.reason}>
                            {e.reason || "—"}
                          </td>
                          <td className="py-2 px-2">{e.authorisedBy}</td>
                          <td className="py-2 px-2 text-[10px] text-muted-foreground">
                            {e.bmrRef || e.grnRef || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {tab === "new" && (
          <div className="space-y-3 max-w-4xl">
            {hasPrefill && (
              <div className="alert-strip alert-strip-info text-xs">
                Prefilled from{" "}
                {prefillBmrRef && <span className="font-mono">{prefillBmrRef}</span>}
                {prefillGrnRef && <span className="font-mono">{prefillGrnRef}</span>}
              </div>
            )}

            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Item identification</div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Item type *</label>
                  <select
                    value={form.itemType}
                    onChange={(e) => set("itemType", e.target.value as DisposalEntry["itemType"])}
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="RM">Raw Material</option>
                    <option value="Finished Batch">Finished Batch</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <Field label="Date" type="date" value={form.date} onChange={(v) => set("date", v)} />
                <Field label="Item name *" value={form.itemName} onChange={(v) => set("itemName", v)} />
                <Field label="Batch / Lot no. *" value={form.batchNo} onChange={(v) => set("batchNo", v)} mono />
                <Field label="Quantity *" value={form.qty} onChange={(v) => set("qty", v)} />
                <Field label="Unit" value={form.unit} onChange={(v) => set("unit", v)} />
                <Field label="BMR Ref" value={form.bmrRef || ""} onChange={(v) => set("bmrRef", v)} mono />
                <Field label="GRN Ref" value={form.grnRef || ""} onChange={(v) => set("grnRef", v)} mono />
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Disposal details</div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Disposal method *</label>
                  <select
                    value={form.disposalMethod}
                    onChange={(e) => set("disposalMethod", e.target.value as DisposalEntry["disposalMethod"])}
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Incineration">Incineration</option>
                    <option value="Returned to Supplier">Returned to Supplier</option>
                    <option value="Reprocessing">Reprocessing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div />
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Reason for disposal *</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => set("reason", e.target.value)}
                    rows={3}
                    placeholder="e.g. QC failure — pH out of spec, contamination, expired stock"
                    className="mt-1 w-full px-2 py-1.5 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Signatures</div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <Field label="Authorised by *" value={form.authorisedBy} onChange={(v) => set("authorisedBy", v)} />
                <Field label="Witnessed by" value={form.witnessedBy} onChange={(v) => set("witnessedBy", v)} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-3 py-1.5 text-xs rounded border border-border bg-background hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 font-medium"
              >
                Save disposal entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
}) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`mt-1 w-full px-2 py-1.5 text-xs rounded border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring ${
        mono ? "font-mono" : ""
      }`}
    />
  </div>
);

export default DisposalLedger;
