import { createContext, useContext, useState, ReactNode } from "react";

export interface BMRIngredient {
  name: string;
  cat: string;
  requiredQty: number;
  actualQty: number;
  unit: string;
  part: string;
  lot: string;
  cost: number;
}

export interface BMRProcessStep {
  step: string;
  equipment?: string;
  duration?: string;
  temp?: string;
  ipcCheck?: string;
  status: "done" | "current" | "todo";
  operator?: string;
  startTime?: string;
  endTime?: string;
  remarks?: string;
}

export interface BMRRecord {
  id: string;
  batchNo: string;
  productName: string;
  mfrId: string;
  mfrName: string;
  batchSize: number;
  batchUnit: string;
  scaleFactor: number;
  startDate: string;
  status: "Draft" | "In process" | "QC pending" | "Released" | "Rejected";
  ingredients: BMRIngredient[];
  steps: BMRProcessStep[];
  qcParams: { parameter: string; spec: string; result: string }[];
  theoreticalYield: number;
  actualYield: number;
  createdAt: string;
}

interface BMRContextType {
  bmrs: BMRRecord[];
  addBMR: (bmr: BMRRecord) => void;
  updateBMR: (id: string, updates: Partial<BMRRecord>) => void;
  getBMR: (id: string) => BMRRecord | undefined;
}

const BMRContext = createContext<BMRContextType | null>(null);

export const useBMRs = () => {
  const ctx = useContext(BMRContext);
  if (!ctx) throw new Error("useBMRs must be used within BMRProvider");
  return ctx;
};

export const BMRProvider = ({ children }: { children: ReactNode }) => {
  const [bmrs, setBMRs] = useState<BMRRecord[]>([]);

  const addBMR = (bmr: BMRRecord) => setBMRs((prev) => [...prev, bmr]);

  const updateBMR = (id: string, updates: Partial<BMRRecord>) =>
    setBMRs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const getBMR = (id: string) => bmrs.find((b) => b.id === id);

  return (
    <BMRContext.Provider value={{ bmrs, addBMR, updateBMR, getBMR }}>
      {children}
    </BMRContext.Provider>
  );
};
