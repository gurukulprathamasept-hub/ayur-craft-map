interface Props {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  "Batch header",
  "Sub-processes",
  "Ingredients",
  "Process log",
  "IPC checks",
  "Yield & packing",
  "QC release",
];

const BMRStepper = ({ currentStep, onStepClick }: Props) => (
  <div className="flex items-center flex-wrap gap-0 mb-4 overflow-x-auto pb-1">
    {STEPS.map((name, i) => {
      const step = i + 1;
      const status = step < currentStep ? "done" : step === currentStep ? "current" : "todo";
      return (
        <div key={step} className="contents">
          {i > 0 && <div className="h-px bg-border w-3.5 shrink-0 mx-0.5" />}
          <div className="flex items-center gap-1 shrink-0 cursor-pointer" onClick={() => onStepClick(step)}>
            <div className={`step-num step-num-${status} w-[22px] h-[22px] text-[9px]`}>{step}</div>
            <span className={`text-[11px] whitespace-nowrap ${status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {name}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

export default BMRStepper;
