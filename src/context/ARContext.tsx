import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AnalyticalRecord {
  id: string;
  arNo: string;
  sampleName: string;
  batchNo: string;
  rmCode: string;
  dateReceived: string;
  dateAnalysis: string;
  analyst: string;
  approver: string;
  pH: string;
  specificGravity: string;
  refractiveIndex: string;
  assayResult: string;
  otherTests: string;
  status: "pending" | "approved" | "rejected";
  grnRef: string;
  bmrRef: string;
}

interface ARContextType {
  ars: AnalyticalRecord[];
  addAR: (ar: AnalyticalRecord) => void;
  updateAR: (id: string, patch: Partial<AnalyticalRecord>) => void;
  getAR: (id: string) => AnalyticalRecord | undefined;
}

const ARContext = createContext<ARContextType | null>(null);

const STORAGE_KEY = "ayur_ars";

export const useAR = () => {
  const ctx = useContext(ARContext);
  if (!ctx) throw new Error("useAR must be used within ARProvider");
  return ctx;
};

export const ARProvider = ({ children }: { children: ReactNode }) => {
  const [ars, setArs] = useState<AnalyticalRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ars));
    } catch {
      /* ignore */
    }
  }, [ars]);

  const addAR = (ar: AnalyticalRecord) => setArs((prev) => [ar, ...prev]);
  const updateAR = (id: string, patch: Partial<AnalyticalRecord>) =>
    setArs((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const getAR = (id: string) => ars.find((a) => a.id === id);

  return (
    <ARContext.Provider value={{ ars, addAR, updateAR, getAR }}>
      {children}
    </ARContext.Provider>
  );
};
