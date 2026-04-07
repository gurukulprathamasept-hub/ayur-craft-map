import { BMRRecord, BMRQCTest, BMRSignature } from "@/context/BMRContext";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const SIG_COLORS: Record<string, { bg: string; text: string }> = {
  teal: { bg: "bg-[hsl(var(--badge-teal-bg))]", text: "text-[hsl(var(--badge-teal-text))]" },
  blue: { bg: "bg-[hsl(var(--badge-blue-bg))]", text: "text-[hsl(var(--badge-blue-text))]" },
  purple: { bg: "bg-[hsl(var(--badge-purple-bg))]", text: "text-[hsl(var(--badge-purple-text))]" },
};

const Step6QCRelease = ({ bmr, onChange }: Props) => {
  const updateQC = (idx: number, updates: Partial<BMRQCTest>) => {
    const qcParams = bmr.qcParams.map((q, i) => i === idx ? { ...q, ...updates } : q);
    onChange({ qcParams });
  };

  const passCount = bmr.qcParams.filter(q => q.compliance === "pass").length;
  const failCount = bmr.qcParams.filter(q => q.compliance === "fail").length;
  const allPass = bmr.qcParams.length > 0 && failCount === 0 && passCount === bmr.qcParams.length;

  const updateSignature = (idx: number, updates: Partial<BMRSignature>) => {
    const signatures = bmr.signatures.map((s, i) => i === idx ? { ...s, ...updates } : s);
    onChange({ signatures });
  };

  const signRelease = (idx: number) => {
    const now = new Date();
    const ts = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    updateSignature(idx, { signed: true, signedAt: ts });
  };

  const updateChecklist = (key: string, value: boolean) => {
    onChange({ checklist: { ...bmr.checklist, [key]: value } });
  };

  const releaseBatch = () => {
    const allChecked = Object.values(bmr.checklist).every(Boolean);
    if (!allChecked) {
      toast.error("Please complete all checklist items before releasing the batch.");
      return;
    }
    if (!allPass) {
      toast.error("Cannot release — QC tests have failures.");
      return;
    }
    onChange({ released: true, status: "Released" });
    toast.success(`Batch ${bmr.batchNo} released! Finished goods inventory updated.`);
  };

  const complianceClass = (c: string) =>
    c === "pass" ? "form-input-sm !border-primary !bg-[hsl(var(--badge-green-bg))] !text-[hsl(var(--badge-green-text))] font-medium"
    : c === "fail" ? "form-input-sm !border-destructive !bg-[hsl(var(--badge-red-bg))] !text-[hsl(var(--badge-red-text))] font-medium"
    : "form-input-sm";

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.16, 20, 21: Analytical report number, result of test and analysis, signature of competent technical staff, counter-signature of QC head.</span>
      </div>

      {/* QC Analytical Record */}
      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Batch QC analytical record</div>
          <span className="app-badge app-badge-purple">Schedule U §III-C & D</span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-4 gap-2.5 mb-3">
            <div className="form-field">
              <label>Analytical report no.</label>
              <input value={bmr.arReportNo} onChange={e => onChange({ arReportNo: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Date sample sent to QC</label>
              <input type="date" value={bmr.dateSampleSentToQC} onChange={e => onChange({ dateSampleSentToQC: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Date of analysis</label>
              <input type="date" value={bmr.dateOfAnalysis} onChange={e => onChange({ dateOfAnalysis: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Batch no. on report</label>
              <input value={bmr.batchNo} readOnly className="bg-secondary" />
            </div>
          </div>

          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground pb-1.5 mb-2.5 border-b border-border">Tests applied to finished batch</div>
          <table className="app-table text-[11px] mb-3">
            <thead>
              <tr><th>Test parameter</th><th>Limit / specification</th><th>Result / value</th><th>Compliance</th></tr>
            </thead>
            <tbody>
              {bmr.qcParams.map((q, i) => (
                <tr key={i}>
                  <td className="font-medium">{q.parameter}</td>
                  <td className="text-muted-foreground">{q.spec}</td>
                  <td><input className="form-input-sm w-28" value={q.result} onChange={e => updateQC(i, { result: e.target.value })} /></td>
                  <td>
                    <select className={complianceClass(q.compliance)} value={q.compliance}
                      onChange={e => updateQC(i, { compliance: e.target.value as BMRQCTest["compliance"] })}>
                      <option value="">—</option>
                      <option value="pass">Complies</option>
                      <option value="fail">Fails</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground pb-1.5 mb-2.5 border-b border-border">Analyst opinion</div>
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>Overall result</label>
              <select value={bmr.analystOverallResult} onChange={e => onChange({ analystOverallResult: e.target.value })}>
                <option>Standard quality — complies</option>
                <option>Not of standard quality</option>
              </select>
            </div>
            <div className="form-field">
              <label>Analytical report date</label>
              <input type="date" value={bmr.dateOfAnalysis} onChange={e => onChange({ dateOfAnalysis: e.target.value })} />
            </div>
          </div>
          <div className="form-field">
            <label>Analyst remarks</label>
            <textarea className="min-h-[60px]" value={bmr.analystRemarks} onChange={e => onChange({ analystRemarks: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Rejection record */}
      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Rejected batches & withdrawn market batches</div>
          <span className="app-badge app-badge-gray">§I-A.17</span>
        </div>
        <div className="p-3.5 grid grid-cols-3 gap-2.5">
          <div className="form-field">
            <label>Any rejection in this batch?</label>
            <select value={bmr.rejectionInBatch} onChange={e => onChange({ rejectionInBatch: e.target.value })}>
              <option>No</option><option>Yes — see details below</option>
            </select>
          </div>
          <div className="form-field">
            <label>Any batches withdrawn from market?</label>
            <select value={bmr.batchesWithdrawn} onChange={e => onChange({ batchesWithdrawn: e.target.value })}>
              <option>No</option><option>Yes — see details below</option>
            </select>
          </div>
          <div className="form-field">
            <label>Disposal record ref.</label>
            <input value={bmr.disposalRef} onChange={e => onChange({ disposalRef: e.target.value })} placeholder="N/A" />
          </div>
        </div>
      </div>

      {/* Release decision */}
      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Release decision & signatures</div>
          <span className="app-badge app-badge-gray">§I-A.20 & 21</span>
        </div>
        <div className="p-3.5">
          {/* Overall result box */}
          <div className={`rounded-md p-3 flex items-center gap-2.5 mb-3 border ${
            allPass ? "bg-[hsl(var(--badge-green-bg))] border-[hsl(var(--success))]" :
            failCount > 0 ? "bg-[hsl(var(--badge-red-bg))] border-destructive" :
            "bg-secondary border-border"
          }`}>
            {allPass ? <CheckCircle className="w-5 h-5 text-primary shrink-0" /> :
             failCount > 0 ? <XCircle className="w-5 h-5 text-destructive shrink-0" /> :
             <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0" />}
            <div className="flex-1">
              <div className="font-medium text-[13px]">
                {allPass ? "All QC tests compliant — batch is of standard quality" :
                 failCount > 0 ? `${failCount} test(s) failed — batch not eligible for release` :
                 "QC testing incomplete"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {passCount} / {bmr.qcParams.length} tests pass
              </div>
            </div>
            {allPass && <span className="app-badge app-badge-green">Standard quality</span>}
          </div>

          {/* Signatures */}
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground pb-1.5 mb-2.5 border-b border-border">
            Authorised signatures — Schedule U §I-A.20 & 21
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {bmr.signatures.map((sig, i) => {
              const colors = SIG_COLORS[sig.color] || SIG_COLORS.teal;
              return (
                <div key={i} className="border border-border rounded-md p-2.5 flex items-center gap-2.5 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => !sig.signed && sig.name && signRelease(i)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold ${colors.bg} ${colors.text}`}>
                    {sig.initials || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input className="form-input-sm w-full font-medium mb-0.5" value={sig.name}
                      onChange={e => updateSignature(i, { name: e.target.value, initials: e.target.value.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() })}
                      onClick={e => e.stopPropagation()} placeholder="Name" />
                    <div className="text-[10px] text-muted-foreground">{sig.role}</div>
                    <div className={`text-[10px] mt-0.5 ${sig.signed ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                      {sig.signed ? `✓ Signed · ${sig.signedAt}` : "Click to sign"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checklist */}
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground pb-1.5 mb-2.5 border-b border-border">
            Final BMR completion checklist
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {Object.entries(bmr.checklist).map(([key, checked]) => (
              <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={checked} onChange={e => updateChecklist(key, e.target.checked)} />
                {key}
              </label>
            ))}
          </div>

          <button
            onClick={releaseBatch}
            disabled={bmr.released}
            className={`w-full py-2 rounded-md text-xs font-medium transition-all ${
              bmr.released
                ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] cursor-default"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {bmr.released
              ? `✓ Batch ${bmr.batchNo} released — Certificate generated`
              : "Release batch to warehouse & generate batch certificate"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Step6QCRelease;
