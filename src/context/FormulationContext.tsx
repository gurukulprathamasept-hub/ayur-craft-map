import { createContext, useContext, useState, ReactNode } from "react";

export type RMCategory = "herb" | "extract" | "mineral" | "animal" | "base" | "process";

export interface RMItem {
  name: string;
  cat: RMCategory;
  qty: number; // quantity per standard batch
  unit: string; // kg, g, L, ml etc.
  part: string;
  /** RM master code (e.g. "RM-001") — auto-filled when picked from RM master. */
  rmCode?: string;
  /** Botanical / scientific name — auto-filled when picked from RM master. */
  botanical?: string;
}

export interface ProcessStep {
  step: string;
  equipment?: string;
  duration?: string;
  temp?: string;
  ipcCheck?: string;
}

export interface QCParam {
  parameter: string;
  spec: string;
}

export interface PackSizeOption {
  label: string;                       // e.g. "100 g HDPE jar"
  primaryPacksPerStdBatch: number;     // packs per standard batch
  secondaryPack: string;               // e.g. "Corrugated shipper x 24"
  shippersPerStdBatch: number;
}

export interface PackagingSpec {
  // Multiple pack-size options per formulation
  packSizes: PackSizeOption[];
  qcRetainSample: string;              // grams retained for QC (shared)
  // Legacy single-pack fields (kept optional for backwards compatibility)
  primaryPackSize?: string;
  defaultPrimaryPacks?: number;
  secondaryPack?: string;
  defaultShippers?: number;
}

export interface Formulation {
  id: string;
  name: string;
  sanskrit: string;
  type: string;
  form: string;
  ref: string;
  /** Manually-assigned MFR code, e.g. "MFR-TCH-001" — preferred source for batch prefix. */
  code?: string;
  /** Resolved (collision-free) batch number prefix, e.g. "TRCH". Stored once and stable. */
  batchPrefix?: string;
  use: string;
  shelf: string;
  standardBatchSize: number;
  standardBatchUnit: string;
  rm: RMItem[];
  steps: ProcessStep[];
  qc: QCParam[];
  ipc: string;
  dosha: string;
  // Yield expectations (Schedule U §I-A.18)
  expectedYieldPct: number;      // theoretical yield as % of batch size, e.g. 98
  yieldLossNote?: string;        // explanation of expected loss (drying, sieving, etc.)
  // Packaging template (Schedule U §I-A.19)
  packaging: PackagingSpec;
  createdAt: string;
  isReference?: boolean; // true for pre-loaded reference data
}

interface FormulationContextType {
  formulations: Formulation[];
  addFormulation: (f: Formulation) => void;
  updateFormulation: (id: string, f: Formulation) => void;
  deleteFormulation: (id: string) => void;
  getFormulation: (id: string) => Formulation | undefined;
  /** Set of batch prefixes currently used by other formulations (excluding the given id). */
  getUsedPrefixes: (excludeId?: string) => string[];
}

const FormulationContext = createContext<FormulationContextType | null>(null);

export const useFormulations = () => {
  const ctx = useContext(FormulationContext);
  if (!ctx) throw new Error("useFormulations must be used within FormulationProvider");
  return ctx;
};

export const FormulationProvider = ({ children }: { children: ReactNode }) => {
  const [formulations, setFormulations] = useState<Formulation[]>([]);

  const addFormulation = (f: Formulation) => {
    setFormulations((prev) => [...prev, f]);
  };

  const updateFormulation = (id: string, f: Formulation) => {
    setFormulations((prev) => prev.map((p) => (p.id === id ? f : p)));
  };

  const deleteFormulation = (id: string) => {
    setFormulations((prev) => prev.filter((p) => p.id !== id));
  };

  const getFormulation = (id: string) => formulations.find((f) => f.id === id);

  const getUsedPrefixes = (excludeId?: string) =>
    formulations
      .filter((f) => f.id !== excludeId && !!f.batchPrefix)
      .map((f) => f.batchPrefix!.toUpperCase());

  return (
    <FormulationContext.Provider value={{ formulations, addFormulation, updateFormulation, deleteFormulation, getFormulation, getUsedPrefixes }}>
      {children}
    </FormulationContext.Provider>
  );
};
