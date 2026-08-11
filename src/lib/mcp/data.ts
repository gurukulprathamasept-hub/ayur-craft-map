import { referenceFormulations } from "@/data/referenceFormulations";
import { CAT_LABELS, DOSAGE_FORMS } from "@/lib/formulationConstants";
import type { Formulation } from "@/context/FormulationContext";

export { referenceFormulations, CAT_LABELS, DOSAGE_FORMS };

export function summarise(f: Formulation) {
  return {
    id: f.id,
    name: f.name,
    sanskrit: f.sanskrit,
    type: f.type,
    dosageForm: f.form,
    pharmacopoeialReference: f.ref,
    therapeuticUse: f.use,
    shelfLife: f.shelf,
    standardBatchSize: `${f.standardBatchSize} ${f.standardBatchUnit}`,
    ingredientCount: f.rm.length,
  };
}

export function detail(f: Formulation) {
  return {
    ...summarise(f),
    dosha: f.dosha,
    expectedYieldPct: f.expectedYieldPct,
    ingredients: f.rm.map((rm) => ({
      name: rm.name,
      category: rm.cat,
      categoryLabel: CAT_LABELS[rm.cat] ?? rm.cat,
      quantity: rm.qty > 0 ? `${rm.qty} ${rm.unit}` : rm.unit,
      partUsed: rm.part,
      botanical: rm.botanical,
    })),
    subProcesses: (f.subProcesses ?? []).map((sp) => ({
      type: sp.type,
      name: sp.name,
      description: sp.description,
      waterRatio: sp.waterRatio,
      reductionTarget: sp.reductionTarget,
      cycles: sp.numberOfCycles,
      completionTest: sp.completionTest,
      ingredients: sp.ingredients.map((i) => i.name),
    })),
    processSteps: f.steps.map((s, i) => ({
      no: i + 1,
      step: s.step,
      equipment: s.equipment,
      duration: s.duration,
      temperature: s.temp,
      ipcCheck: s.ipcCheck,
    })),
    qcParameters: f.qc.map((q) => ({ parameter: q.parameter, specification: q.spec })),
    inProcessControls: f.ipc,
    packaging: {
      packSizes: f.packaging?.packSizes ?? [],
      qcRetainSample: f.packaging?.qcRetainSample,
    },
  };
}

export function findFormulation(query: string) {
  const q = query.trim().toLowerCase();
  return (
    referenceFormulations.find((f) => f.id.toLowerCase() === q) ??
    referenceFormulations.find((f) => f.name.toLowerCase() === q) ??
    referenceFormulations.find(
      (f) => f.name.toLowerCase().includes(q) || f.sanskrit.includes(query.trim()),
    )
  );
}
