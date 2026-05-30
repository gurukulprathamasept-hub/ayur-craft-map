import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Check, Loader2 } from "lucide-react";
import { BMRRecord, useBMRs } from "@/context/BMRContext";
import { toast } from "sonner";
import BMRStepper from "./BMRStepper";
import Step1BatchHeader from "./Step1BatchHeader";
import Step2Ingredients from "./Step2Ingredients";
import Step3ProcessLog from "./Step3ProcessLog";
import Step4IPCChecks from "./Step4IPCChecks";
import Step5YieldPacking from "./Step5YieldPacking";
import Step6QCRelease from "./Step6QCRelease";
import StepSubProcesses from "./StepSubProcesses";
import BMRPrintable from "./BMRPrintable";

const STEP_SUBTITLES: Record<number, string> = {
  1: "Step 1: Batch header · Ref: AFI Vol.I · Schedule U §I-A",
  2: "Step 2: Sub-processes · Intermediate preparations (Kwatha, Kalka, Bhavana, Shodhana)",
  3: "Step 3: Ingredients · Qty required vs actually used · §I-A.7 & 8",
  4: "Step 4: Process log · Environmental controls · §I-A.9-13",
  5: "Step 5: IPC checks · In-process quality control · §I-A.13",
  6: "Step 6: Yield & packing · Batch certificate · §I-A.18-23",
  7: "Step 7: QC release · Analytical report · §I-A.16, 20-22",
};

interface Props {
  bmrId: string;
  prevBatchNo?: string | null;
}

const BMRWizard = ({ bmrId, prevBatchNo }: Props) => {
  const navigate = useNavigate();
  const { getBMR, updateBMR } = useBMRs();
  const bmr = getBMR(bmrId);
  const [step, setStep] = useState(bmr?.currentStep || 1);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<BMRRecord> | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((updates: Partial<BMRRecord>) => {
    setPendingUpdates((prev) => ({ ...(prev || {}), ...updates, currentStep: Math.max(bmr?.currentStep || 1, step) }));
    setSaveState("saving");
  }, [bmr?.currentStep, step]);

  useEffect(() => {
    if (!pendingUpdates) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateBMR(bmrId, pendingUpdates);
      setPendingUpdates(null);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [pendingUpdates, bmrId, updateBMR]);

  if (!bmr) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-sm text-muted-foreground mb-2">BMR not found</div>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">
          Back to BMR list
        </button>
      </div>
    );
  }

  const goStep = (n: number) => {
    setStep(n);
    updateBMR(bmrId, { currentStep: Math.max(bmr.currentStep, n) });
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">Batch Manufacturing Record — {bmr.productName}</div>
          <div className="text-[11px] text-muted-foreground mt-px truncate">
            {bmr.batchNo} · {STEP_SUBTITLES[step]}
          </div>
        </div>
        {step > 1 && (
          <button onClick={() => goStep(step - 1)} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">
            ← Back
          </button>
        )}
        <div
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground"
          aria-live="polite"
          title="Changes are saved automatically"
        >
          {saveState === "saving" ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
          ) : saveState === "saved" ? (
            <><Check className="w-3 h-3 text-primary" /> Autosaved</>
          ) : (
            <><Check className="w-3 h-3 opacity-50" /> Autosaved</>
          )}
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1"
          title="Print blank BMR for supervisor to fill by hand"
        >
          <Printer className="w-3 h-3" /> Print BMR
        </button>
        <button
          onClick={() => step < 7 ? goStep(step + 1) : null}
          className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
        >
          {step < 7 ? "Next step →" : "Finalise BMR"}
        </button>
        <button onClick={() => navigate("/bmr")} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> BMR list
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <BMRStepper currentStep={step} onStepClick={goStep} />

        {step === 1 && <Step1BatchHeader bmr={bmr} onChange={handleChange} prevBatchNo={prevBatchNo || null} />}
        {step === 2 && <StepSubProcesses bmr={bmr} onChange={handleChange} />}
        {step === 3 && <Step2Ingredients bmr={bmr} onChange={handleChange} />}
        {step === 4 && <Step3ProcessLog bmr={bmr} onChange={handleChange} />}
        {step === 5 && <Step4IPCChecks bmr={bmr} onChange={handleChange} />}
        {step === 6 && <Step5YieldPacking bmr={bmr} onChange={handleChange} />}
        {step === 7 && <Step6QCRelease bmr={bmr} onChange={handleChange} />}
      </div>

      {/* Hidden printable view — only visible during window.print() */}
      <BMRPrintable bmr={bmr} />
    </>
  );
};

export default BMRWizard;
