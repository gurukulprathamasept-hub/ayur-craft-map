import { createContext, useContext, useState, ReactNode } from "react";

export type RMCategory = "herb" | "extract" | "mineral" | "animal" | "base" | "process";

export interface RMItem {
  name: string;
  cat: RMCategory;
  qty: number; // quantity per standard batch
  unit: string; // kg, g, L, ml etc.
  part: string;
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

export interface Formulation {
  id: string;
  name: string;
  sanskrit: string;
  type: string;
  form: string;
  ref: string;
  use: string;
  shelf: string;
  standardBatchSize: number;
  standardBatchUnit: string;
  rm: RMItem[];
  steps: ProcessStep[];
  qc: QCParam[];
  ipc: string;
  dosha: string;
  createdAt: string;
  isReference?: boolean; // true for pre-loaded reference data
}

interface FormulationContextType {
  formulations: Formulation[];
  addFormulation: (f: Formulation) => void;
  getFormulation: (id: string) => Formulation | undefined;
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

  const getFormulation = (id: string) => formulations.find((f) => f.id === id);

  return (
    <FormulationContext.Provider value={{ formulations, addFormulation, getFormulation }}>
      {children}
    </FormulationContext.Provider>
  );
};
