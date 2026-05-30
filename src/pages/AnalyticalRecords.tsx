import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FlaskConical, ClipboardList, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAR, AnalyticalRecord } from "@/context/ARContext";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

type Tab = "register" | "new";

const STATUS_BADGE: Record<AnalyticalRecord["status"], string> = {
  pending: "app-badge-amber",
  approved: "app-badge-green",
  rejected: "app-badge-red",
};

const STATUS_ICON = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
};

const today = () => new Date().toISOString().slice(0, 10);

const nextArNo = (existing: AnalyticalRecord[]) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const prefix = `AR-${year}${month}-`;
  const matching = existing.filter((a) => a.arNo.startsWith(prefix));
  const seq = String(matching.length + 1).padStart(4, "0");
  return `${prefix}${seq}`;
};

const emptyForm = (): Omit<AnalyticalRecord, "id"> => ({
  arNo: "",
  sampleName: "",
  batchNo: "",
  rmCode: "",
  dateReceived: today(),
  dateAnalysis: today(),
  analyst: "",
  approver: "",
  pH: "",
  specificGravity: "",
  refractiveIndex: "",
  assayResult: "",
  otherTests: "",
  status: "pending",
  grnRef: "",
  bmrRef: "",
});

const AnalyticalRecords = () => {
  const { ars, addAR, updateAR } = useAR();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const grnRefParam = params.get("grnRef") || "";
  const bmrRefParam = params.get("bmrRef") || "";

  const [tab, setTab] = useState<Tab>(grnRefParam || bmrRefParam ? "new" : "register");
  const [form, setForm] = useState<Omit<AnalyticalRecord, "id">>(() => ({
    ...emptyForm(),
    grnRef: grnRefParam,
    bmrRef: bmrRefParam,
    analyst: "",
  }));

  useEffect(() => {
    setForm((f) => ({
      ...f,
      arNo: f.arNo || nextArNo(ars),
      analyst: f.analyst || currentUser?.name || "",
    }));
  }, [ars, currentUser, tab]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (status: AnalyticalRecord["status"]) => {
    if (!form.sampleName || !form.batchNo) {
      toast.error("Sample name and batch no. are required");
      return;
    }
    const rec: AnalyticalRecord = {
      ...form,
      status,
      id: `ar_${Date.now()}`,
      arNo: form.arNo || nextArNo(ars),
    };
    addAR(rec);
    toast.success(`AR ${rec.arNo} saved (${status})`);
    setForm({ ...emptyForm(), arNo: nextArNo([rec, ...ars]), analyst: currentUser?.name || "" });
    if (grnRefParam || bmrRefParam) {
      setParams({});
    }
    setTab("register");
  };

  const sortedArs = useMemo(
    () => [...ars].sort((a, b) => b.arNo.localeCompare(a.arNo)),
    [ars]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          <h1 className="text-base font-semibold">Analytical Records</h1>
          <span className="text-xs text-muted-foreground ml-2">
            Schedule U — Analytical Record Register
          </span>
        </div>
        <div className="mt-3 inline-flex rounded-md border border-border overflow-hidden bg-card">
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
              tab === "register"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <ClipboardList className="w-3 h-3" /> AR Register ({ars.length})
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
            <Plus className="w-3 h-3" /> New AR
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {tab === "register" && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title">All Analytical Records</div>
            </div>
            <div className="p-3">
              {sortedArs.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  No analytical records yet. Create one from the "New AR" tab.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="text-left py-2 px-2 font-medium">AR No.</th>
                      <th className="text-left py-2 px-2 font-medium">Sample</th>
                      <th className="text-left py-2 px-2 font-medium">Batch</th>
                      <th className="text-left py-2 px-2 font-medium">Date</th>
                      <th className="text-left py-2 px-2 font-medium">Analyst</th>
                      <th className="text-left py-2 px-2 font-medium">Ref</th>
                      <th className="text-left py-2 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedArs.map((a) => {
                      const Icon = STATUS_ICON[a.status];
                      return (
                        <tr key={a.id} className="border-b border-border last:border-b-0">
                          <td className="py-2 px-2 font-mono font-medium">{a.arNo}</td>
                          <td className="py-2 px-2">{a.sampleName}</td>
                          <td className="py-2 px-2 font-mono">{a.batchNo}</td>
                          <td className="py-2 px-2 text-muted-foreground">{a.dateAnalysis}</td>
                          <td className="py-2 px-2">{a.analyst}</td>
                          <td className="py-2 px-2 text-[10px] text-muted-foreground">
                            {a.grnRef || a.bmrRef || "—"}
                          </td>
                          <td className="py-2 px-2">
                            <span className={`${STATUS_BADGE[a.status]} inline-flex items-center gap-1`}>
                              <Icon className="w-3 h-3" />
                              {a.status}
                            </span>
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
            {(grnRefParam || bmrRefParam) && (
              <div className="alert-strip alert-strip-info text-xs">
                Linked to: {grnRefParam && <span className="font-mono">{grnRefParam}</span>}
                {bmrRefParam && <span className="font-mono">{bmrRefParam}</span>}
              </div>
            )}

            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Sample Identification</div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <Field label="AR No." value={form.arNo} onChange={(v) => set("arNo", v)} mono />
                <Field label="Sample Name *" value={form.sampleName} onChange={(v) => set("sampleName", v)} />
                <Field label="Batch No. *" value={form.batchNo} onChange={(v) => set("batchNo", v)} mono />
                <Field label="RM Code" value={form.rmCode} onChange={(v) => set("rmCode", v)} mono />
                <Field label="Date Received" type="date" value={form.dateReceived} onChange={(v) => set("dateReceived", v)} />
                <Field label="Date of Analysis" type="date" value={form.dateAnalysis} onChange={(v) => set("dateAnalysis", v)} />
                <Field label="GRN Ref" value={form.grnRef} onChange={(v) => set("grnRef", v)} mono />
                <Field label="BMR Ref" value={form.bmrRef} onChange={(v) => set("bmrRef", v)} mono />
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-head">
                <div className="app-card-title">Analytical Tests</div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <Field label="pH" value={form.pH} onChange={(v) => set("pH", v)} />
                <Field label="Specific Gravity" value={form.specificGravity} onChange={(v) => set("specificGravity", v)} />
                <Field label="Refractive Index" value={form.refractiveIndex} onChange={(v) => set("refractiveIndex", v)} />
                <Field label="Assay Result" value={form.assayResult} onChange={(v) => set("assayResult", v)} />
                <div className="col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Other Tests / Observations
                  </label>
                  <textarea
                    value={form.otherTests}
                    onChange={(e) => set("otherTests", e.target.value)}
                    rows={3}
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
                <Field label="Analyst" value={form.analyst} onChange={(v) => set("analyst", v)} />
                <Field label="Approver (QC Head)" value={form.approver} onChange={(v) => set("approver", v)} />
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
                onClick={() => handleSave("pending")}
                className="px-3 py-1.5 text-xs rounded border border-border bg-background hover:bg-secondary"
              >
                Save as Pending
              </button>
              <button
                type="button"
                onClick={() => handleSave("rejected")}
                className="px-3 py-1.5 text-xs rounded border border-destructive/40 text-destructive bg-background hover:bg-destructive/5"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleSave("approved")}
                className="px-3 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 font-medium"
              >
                Approve & Save
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

export default AnalyticalRecords;
