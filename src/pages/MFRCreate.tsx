import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import { useFormulations, RMItem, ProcessStep, QCParam, PackagingSpec } from "@/context/FormulationContext";
import RMSearchInput from "@/components/RMSearchInput";
import { toast } from "sonner";

const dosageForms = ["Churna", "Arishta/Asava", "Avaleha", "Taila", "Ghrita", "Vati/Gutika", "Bhasma", "Other"];
const rmCategories = ["herb", "extract", "mineral", "animal", "base", "process"] as const;
const CAT_LABELS: Record<string, string> = { herb: "Herb", extract: "Extract", mineral: "Mineral", animal: "Animal", base: "Base / Excipient", process: "Process agent" };

const STEPS = ["Basic info", "Ingredients", "Process steps", "Yield & Packaging", "QC & IPC"];

const emptyRM = (): RMItem => ({ name: "", cat: "herb", qty: 0, unit: "kg", part: "" });
const emptyStep = (): ProcessStep => ({ step: "", equipment: "", duration: "", temp: "", ipcCheck: "" });
const emptyQC = (): QCParam => ({ parameter: "", spec: "" });
const emptyPackaging = (): PackagingSpec => ({
  primaryPackSize: "100 g HDPE jar",
  defaultPrimaryPacks: 0,
  qcRetainSample: "20",
  secondaryPack: "",
  defaultShippers: 0,
});

const MFRCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { addFormulation, updateFormulation, getFormulation } = useFormulations();
  const [activeStep, setActiveStep] = useState(0);

  // Basic info
  const [name, setName] = useState("");
  const [sanskrit, setSanskrit] = useState("");
  const [type, setType] = useState("Churna");
  const [form, setForm] = useState("");
  const [ref, setRef] = useState("");
  const [use, setUse] = useState("");
  const [shelf, setShelf] = useState("");
  const [dosha, setDosha] = useState("");
  const [batchSize, setBatchSize] = useState<number>(10);
  const [batchUnit, setBatchUnit] = useState("kg");

  // Ingredients
  const [ingredients, setIngredients] = useState<RMItem[]>([emptyRM()]);

  // Process steps
  const [steps, setSteps] = useState<ProcessStep[]>([emptyStep()]);

  // QC
  const [qcParams, setQcParams] = useState<QCParam[]>([emptyQC()]);
  const [ipc, setIpc] = useState("");

  // Yield & Packaging
  const [expectedYieldPct, setExpectedYieldPct] = useState<number>(98);
  const [yieldLossNote, setYieldLossNote] = useState("");
  const [packaging, setPackaging] = useState<PackagingSpec>(emptyPackaging());

  // Load existing formulation for editing
  useEffect(() => {
    if (editId) {
      const existing = getFormulation(editId);
      if (existing) {
        setName(existing.name);
        setSanskrit(existing.sanskrit);
        setType(existing.type);
        setForm(existing.form);
        setRef(existing.ref);
        setUse(existing.use);
        setShelf(existing.shelf);
        setDosha(existing.dosha);
        setBatchSize(existing.standardBatchSize);
        setBatchUnit(existing.standardBatchUnit);
        setIngredients(existing.rm.length ? existing.rm : [emptyRM()]);
        setSteps(existing.steps.length ? existing.steps : [emptyStep()]);
        setQcParams(existing.qc.length ? existing.qc : [emptyQC()]);
        setIpc(existing.ipc);
        setExpectedYieldPct(existing.expectedYieldPct ?? 98);
        setYieldLossNote(existing.yieldLossNote || "");
        setPackaging(existing.packaging || emptyPackaging());
      }
    }
  }, [editId]);

  const updateIngredient = (i: number, field: keyof RMItem, value: any) => {
    setIngredients((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };
  const updateStep = (i: number, field: keyof ProcessStep, value: string) => {
    setSteps((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };
  const updateQC = (i: number, field: keyof QCParam, value: string) => {
    setQcParams((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };
  const updatePack = <K extends keyof PackagingSpec>(field: K, value: PackagingSpec[K]) => {
    setPackaging((prev) => ({ ...prev, [field]: value }));
  };

  const theoreticalYield = batchSize * (expectedYieldPct / 100);

  const canProceed = () => {
    if (activeStep === 0) return name.trim() && batchSize > 0;
    if (activeStep === 1) return ingredients.some((r) => r.name.trim() && r.qty > 0);
    if (activeStep === 2) return steps.some((s) => s.step.trim());
    if (activeStep === 3) return expectedYieldPct > 0 && expectedYieldPct <= 100 && packaging.primaryPackSize.trim().length > 0;
    return true;
  };

  const handleSave = () => {
    const formulation = {
      id: editId || `MFR-${Date.now()}`,
      name, sanskrit, type, form, ref, use, shelf, dosha,
      standardBatchSize: batchSize,
      standardBatchUnit: batchUnit,
      rm: ingredients.filter((r) => r.name.trim()),
      steps: steps.filter((s) => s.step.trim()),
      qc: qcParams.filter((q) => q.parameter.trim()),
      ipc,
      expectedYieldPct,
      yieldLossNote,
      packaging,
      createdAt: editId ? (getFormulation(editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    };
    if (editId) {
      updateFormulation(editId, formulation);
      toast.success(`Formulation "${name}" updated successfully`);
    } else {
      addFormulation(formulation);
      toast.success(`Formulation "${name}" created successfully`);
    }
    navigate("/mfr-table");
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">{editId ? "Edit Formulation (MFR)" : "Create New Formulation (MFR)"}</div>
          <div className="text-[11px] text-muted-foreground mt-px">Define standard batch, ingredients, process and QC parameters</div>
        </div>
        <button onClick={() => navigate("/mfr-table")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
      </div>

      {/* Stepper */}
      <div className="px-5 py-3 border-b border-border bg-secondary">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => (
            <div key={i} className="contents">
              {i > 0 && <div className="flex-1 h-px bg-border min-w-3.5 mx-1" />}
              <div className="flex items-center gap-1.5 text-[11px] cursor-pointer" onClick={() => i <= activeStep && setActiveStep(i)}>
                <div className={`step-num ${i < activeStep ? "step-num-done" : i === activeStep ? "step-num-current" : "step-num-todo"}`}>
                  {i < activeStep ? <Check className="w-2.5 h-2.5" /> : i + 1}
                </div>
                <span className={i === activeStep ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Step 0: Basic info */}
        {activeStep === 0 && (
          <div className="app-card">
            <div className="app-card-head"><div className="app-card-title">Basic information</div></div>
            <div className="p-3.5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-field"><label>Formulation name *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Triphala Churna" /></div>
                <div className="form-field"><label>Sanskrit name</label><input value={sanskrit} onChange={(e) => setSanskrit(e.target.value)} placeholder="e.g. त्रिफला चूर्ण" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-field">
                  <label>Dosage form / Category *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    {dosageForms.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-field"><label>Physical form</label><input value={form} onChange={(e) => setForm(e.target.value)} placeholder="e.g. Fine powder (≥80 mesh)" /></div>
                <div className="form-field"><label>Pharmacopoeial reference</label><input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. AFI Vol.I" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-field">
                  <label>Standard batch size *</label>
                  <div className="flex gap-2">
                    <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} className="flex-1 min-w-[120px]" min={0} />
                    <select value={batchUnit} onChange={(e) => setBatchUnit(e.target.value)} className="w-[80px] shrink-0">
                      <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option><option value="units">units</option>
                    </select>
                  </div>
                </div>
                <div className="form-field"><label>Shelf life</label><input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="e.g. 2 years" /></div>
                <div className="form-field"><label>Dosha action</label><input value={dosha} onChange={(e) => setDosha(e.target.value)} placeholder="e.g. Tridoshic" /></div>
              </div>
              <div className="form-field"><label>Therapeutic use</label><textarea value={use} onChange={(e) => setUse(e.target.value)} placeholder="Digestive tonic, laxative, ..." /></div>
            </div>
          </div>
        )}

        {/* Step 1: Ingredients */}
        {activeStep === 1 && (
          <div className="app-card !overflow-visible">
            <div className="app-card-head">
              <div className="app-card-title">Ingredients for {batchSize} {batchUnit} standard batch</div>
              <button onClick={() => setIngredients((p) => [...p, emptyRM()])} className="px-2.5 py-1 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="p-3.5">
              <div className="grid grid-cols-[2fr_120px_80px_60px_1.5fr_32px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border mb-2">
                <div>Raw material name</div><div>Category</div><div>Qty</div><div>Unit</div><div>Part used</div><div></div>
              </div>
              {ingredients.map((rm, i) => (
                <div key={i} className="grid grid-cols-[2fr_120px_80px_60px_1.5fr_32px] gap-2 py-1.5 items-center border-b border-border last:border-b-0">
                  <RMSearchInput
                    value={rm.name}
                    onSelect={(sel) => {
                      const validCats = ["herb","extract","mineral","animal","base","process"];
                      const cat = (validCats.includes(sel.category) ? sel.category : rm.cat) as RMItem["cat"];
                      const validUnits = ["kg","g","L","ml","units","q.s."];
                      const unit = validUnits.includes(sel.uom) ? sel.uom : rm.unit;
                      setIngredients((prev) => prev.map((it, idx) => idx === i ? { ...it, name: sel.name, cat, part: sel.part || it.part, unit } : it));
                    }}
                    placeholder="Search RM (name / botanical / code)..."
                  />

                  <select className="form-field-input" value={rm.cat} onChange={(e) => updateIngredient(i, "cat", e.target.value)}>
                    {rmCategories.map((c) => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </select>
                  <input type="number" className="form-field-input" value={rm.qty || ""} onChange={(e) => updateIngredient(i, "qty", Number(e.target.value))} min={0} step="0.001" />
                  <select className="form-field-input" value={rm.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)}>
                    <option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="ml">ml</option><option value="units">units</option><option value="q.s.">q.s.</option>
                  </select>
                  <input className="form-field-input" value={rm.part} onChange={(e) => updateIngredient(i, "part", e.target.value)} placeholder="e.g. Dried fruit rind" />
                  <button onClick={() => setIngredients((p) => p.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Process steps */}
        {activeStep === 2 && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title">Manufacturing process steps</div>
              <button onClick={() => setSteps((p) => [...p, emptyStep()])} className="px-2.5 py-1 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add step
              </button>
            </div>
            <div className="p-3.5 space-y-3">
              {steps.map((s, i) => (
                <div key={i} className="border border-border rounded-md p-3 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="step-num step-num-current text-[9px] w-5 h-5">{i + 1}</div>
                    <span className="text-xs font-medium">Step {i + 1}</span>
                    <button onClick={() => setSteps((p) => p.filter((_, idx) => idx !== i))} className="ml-auto text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="form-field mb-2"><label>Description *</label><textarea value={s.step} onChange={(e) => updateStep(i, "step", e.target.value)} placeholder="Describe this manufacturing step..." /></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="form-field"><label>Equipment</label><input value={s.equipment} onChange={(e) => updateStep(i, "equipment", e.target.value)} placeholder="e.g. Pulveriser" /></div>
                    <div className="form-field"><label>Duration</label><input value={s.duration} onChange={(e) => updateStep(i, "duration", e.target.value)} placeholder="e.g. 30 min" /></div>
                    <div className="form-field"><label>Temperature</label><input value={s.temp} onChange={(e) => updateStep(i, "temp", e.target.value)} placeholder="e.g. 60°C" /></div>
                  </div>
                  <div className="form-field mt-2"><label>IPC check at this step</label><input value={s.ipcCheck} onChange={(e) => updateStep(i, "ipcCheck", e.target.value)} placeholder="e.g. Particle size uniformity" /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: QC & IPC */}
        {activeStep === 3 && (
          <div className="app-card">
            <div className="app-card-head">
              <div className="app-card-title">QC parameters & IPC checks</div>
              <button onClick={() => setQcParams((p) => [...p, emptyQC()])} className="px-2.5 py-1 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add parameter
              </button>
            </div>
            <div className="p-3.5">
              <div className="grid grid-cols-[1fr_1fr_32px] gap-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border mb-2">
                <div>Parameter</div><div>Specification</div><div></div>
              </div>
              {qcParams.map((q, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 py-1.5 items-center border-b border-border last:border-b-0">
                  <input className="form-field-input" value={q.parameter} onChange={(e) => updateQC(i, "parameter", e.target.value)} placeholder="e.g. Moisture" />
                  <input className="form-field-input" value={q.spec} onChange={(e) => updateQC(i, "spec", e.target.value)} placeholder="e.g. <8% w/w" />
                  <button onClick={() => setQcParams((p) => p.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <div className="form-field mt-4"><label>General IPC notes</label><textarea value={ipc} onChange={(e) => setIpc(e.target.value)} placeholder="Overall IPC checkpoint notes..." /></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-secondary shrink-0">
        <button
          onClick={() => setActiveStep((s) => s - 1)}
          disabled={activeStep === 0}
          className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-card transition-all disabled:opacity-40 flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Previous
        </button>
        {activeStep < STEPS.length - 1 ? (
          <button
            onClick={() => setActiveStep((s) => s + 1)}
            disabled={!canProceed()}
            className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1"
          >
            Next <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> Save formulation
          </button>
        )}
      </div>
    </>
  );
};

export default MFRCreate;
