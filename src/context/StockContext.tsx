import { createContext, useContext, useState, ReactNode } from "react";

export type QCSpec = { parameter: string; spec: string };

export type Txn = {
  date: string;
  type: "Opening" | "Inward" | "Outward";
  typeBadge: string;
  ref: string;
  batch: string;
  expiry: string;
  qtyIn: string;
  qtyOut: string;
  balance: string;
  rate: string;
};

export type RMEntry = {
  code: string;
  name: string;
  botanical: string;
  category: string;
  part: string;
  uom: string;
  reorder: number;
  shelf: string;
  active: boolean;
  currentStock: number;
  qcSpecs: QCSpec[];
  txns: Txn[];
};

const initialData: RMEntry[] = [
  {
    code: "RM-001", name: "Ashwagandha", botanical: "Withania somnifera", category: "Herb", part: "Root", uom: "kg", reorder: 5, shelf: "36 mo", active: true, currentStock: 1.2,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤2%" },
      { parameter: "Total ash", spec: "≤7%" },
      { parameter: "Acid-insoluble ash", spec: "≤1%" },
      { parameter: "Moisture", spec: "≤8%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "6.200", qtyOut: "—", balance: "6.200", rate: "—" },
      { date: "05 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0102", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "8.000", qtyOut: "—", balance: "14.200", rate: "440" },
      { date: "08 Apr 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0058", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "4.800", balance: "9.400", rate: "440" },
      { date: "22 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0071", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "3.200", balance: "6.200", rate: "440" },
      { date: "10 Jun 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0178", batch: "AR/2025-178", expiry: "Jun 2027", qtyIn: "7.000", qtyOut: "—", balance: "13.200", rate: "450" },
      { date: "12 Jun 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0088", batch: "AR/2025-102", expiry: "Mar 2027", qtyIn: "—", qtyOut: "12.000", balance: "1.200", rate: "440" },
    ],
  },
  {
    code: "RM-002", name: "Amalaki / Amla", botanical: "Emblica officinalis", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 10, shelf: "24 mo", active: true, currentStock: 14.5,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤2%" },
      { parameter: "Total ash", spec: "≤5%" },
      { parameter: "Moisture", spec: "≤9%" },
      { parameter: "Vitamin C content", spec: "≥0.4%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "12.000", qtyOut: "—", balance: "12.000", rate: "—" },
      { date: "18 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0115", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "15.000", qtyOut: "—", balance: "27.000", rate: "180" },
      { date: "02 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0062", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "—", qtyOut: "8.000", balance: "19.000", rate: "180" },
      { date: "28 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0075", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "—", qtyOut: "4.500", balance: "14.500", rate: "180" },
    ],
  },
  {
    code: "RM-003", name: "Haritaki", botanical: "Terminalia chebula", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 8, shelf: "24 mo", active: true, currentStock: 6.0,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤2%" },
      { parameter: "Total ash", spec: "≤5%" },
      { parameter: "Moisture", spec: "≤10%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "10.000", qtyOut: "—", balance: "10.000", rate: "—" },
      { date: "12 Apr 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0049", batch: "AR/2025-049", expiry: "Feb 2027", qtyIn: "—", qtyOut: "4.000", balance: "6.000", rate: "220" },
    ],
  },
  {
    code: "RM-004", name: "Vibhitaki", botanical: "Terminalia bellirica", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 5, shelf: "24 mo", active: true, currentStock: 0,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤2%" },
      { parameter: "Total ash", spec: "≤5%" },
      { parameter: "Moisture", spec: "≤10%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "3.000", qtyOut: "—", balance: "3.000", rate: "—" },
      { date: "20 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0069", batch: "AR/2025-050", expiry: "Jan 2027", qtyIn: "—", qtyOut: "3.000", balance: "0.000", rate: "200" },
    ],
  },
  {
    code: "RM-012", name: "Shuddha Guggulu", botanical: "Commiphora wightii", category: "Extract", part: "Purified resin", uom: "kg", reorder: 3, shelf: "60 mo", active: true, currentStock: 4.8,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤1%" },
      { parameter: "Moisture", spec: "≤20%" },
      { parameter: "Ethanol-soluble extractive", spec: "≥25%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "3.000", qtyOut: "—", balance: "3.000", rate: "—" },
      { date: "20 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0120", batch: "AR/2025-120", expiry: "Apr 2030", qtyIn: "5.000", qtyOut: "—", balance: "8.000", rate: "2800" },
      { date: "15 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0068", batch: "AR/2025-120", expiry: "Apr 2030", qtyIn: "—", qtyOut: "3.200", balance: "4.800", rate: "2800" },
    ],
  },
  {
    code: "RM-027", name: "Abhraka (Shuddha)", botanical: "Mica / Biotite", category: "Metal/Mineral", part: "Shodhita flakes", uom: "kg", reorder: 0.5, shelf: "Indef.", active: true, currentStock: 0.35,
    qcSpecs: [
      { parameter: "Loss on ignition", spec: "≤2%" },
      { parameter: "Iron content", spec: "Pass" },
      { parameter: "Particle size", spec: "All passes #120 mesh" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "0.500", qtyOut: "—", balance: "0.500", rate: "—" },
      { date: "05 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0065", batch: "AR/2025-044", expiry: "Indef.", qtyIn: "—", qtyOut: "0.150", balance: "0.350", rate: "3500" },
    ],
  },
  {
    code: "RM-031", name: "Cow ghee", botanical: "Clarified butter (Ghrita)", category: "Animal", part: "Clarified butter", uom: "L", reorder: 5, shelf: "16 mo", active: true, currentStock: 8.0,
    qcSpecs: [
      { parameter: "Rancidity (Kreis test)", spec: "Negative" },
      { parameter: "Butyro refractometer reading (40°C)", spec: "40–44" },
      { parameter: "Moisture", spec: "≤0.5%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "4.000", qtyOut: "—", balance: "4.000", rate: "—" },
      { date: "10 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0108", batch: "AR/2025-108", expiry: "Aug 2026", qtyIn: "10.000", qtyOut: "—", balance: "14.000", rate: "650" },
      { date: "25 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0073", batch: "AR/2025-108", expiry: "Aug 2026", qtyIn: "—", qtyOut: "6.000", balance: "8.000", rate: "650" },
    ],
  },
  {
    code: "RM-044", name: "Dhataki Pushpa", botanical: "Woodfordia fruticosa", category: "Herb", part: "Flower", uom: "kg", reorder: 1, shelf: "18 mo", active: true, currentStock: 0.6,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "≤3%" },
      { parameter: "Total ash", spec: "≤6%" },
      { parameter: "Moisture", spec: "≤10%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "1.200", qtyOut: "—", balance: "1.200", rate: "—" },
      { date: "18 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0070", batch: "AR/2025-033", expiry: "Nov 2026", qtyIn: "—", qtyOut: "0.600", balance: "0.600", rate: "1100" },
    ],
  },
];

type IssueLine = {
  rmName: string;
  qty: number;
  batch: string;
  expiry: string;
  rate?: string;
};

type InwardLine = {
  rmName: string;
  qty: number;
  batch: string;
  expiry: string;
  rate?: string;
};

type StockContextType = {
  rmData: RMEntry[];
  getStockForRM: (name: string) => { available: number; batch: string; batchColor: string; expiry: string; uom: string } | null;
  issueStock: (issRef: string, lines: IssueLine[]) => void;
  inwardStock: (grnRef: string, lines: InwardLine[]) => void;
  addRM: (rm: Omit<RMEntry, "code" | "currentStock" | "txns">) => void;
  updateRM: (code: string, data: Partial<Omit<RMEntry, "code" | "currentStock" | "txns">>) => void;
  deleteRM: (code: string) => void;
  getNextGRN: () => { nextGRN: string; prevGRN: string | null };
  grnCount: number;
  incrementGRN: () => void;
};

const StockContext = createContext<StockContextType | null>(null);

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be inside StockProvider");
  return ctx;
};

const today = () => {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [rmData, setRmData] = useState<RMEntry[]>(initialData);
  const [grnCount, setGrnCount] = useState(187); // start after existing GRN-2025-0187

  const getNextGRN = (): { nextGRN: string; prevGRN: string | null } => {
    const now = new Date();
    const year = now.getFullYear();
    const nextSeq = String(grnCount + 1).padStart(4, "0");
    const prevSeq = grnCount > 0 ? String(grnCount).padStart(4, "0") : null;
    return {
      nextGRN: `GRN-${year}-${nextSeq}`,
      prevGRN: prevSeq ? `GRN-${year}-${prevSeq}` : null,
    };
  };

  const incrementGRN = () => setGrnCount(prev => prev + 1);

  const getStockForRM = (name: string) => {
    const rm = rmData.find(r =>
      r.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(r.name.toLowerCase())
    );
    if (!rm) return null;
    const inwardTxns = rm.txns.filter(t => t.type === "Inward");
    const latestBatch = inwardTxns.length > 0 ? inwardTxns[inwardTxns.length - 1] : null;
    return {
      available: rm.currentStock,
      batch: latestBatch?.batch || "—",
      batchColor: rm.currentStock > 0 ? "teal" : "gray",
      expiry: latestBatch?.expiry || "—",
      uom: rm.uom,
    };
  };

  const issueStock = (issRef: string, lines: IssueLine[]) => {
    setRmData(prev => {
      const updated = [...prev];
      for (const line of lines) {
        const idx = updated.findIndex(r =>
          r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
          line.rmName.toLowerCase().includes(r.name.toLowerCase())
        );
        if (idx === -1 || line.qty <= 0) continue;
        const rm = { ...updated[idx] };
        const newStock = Math.max(0, parseFloat((rm.currentStock - line.qty).toFixed(3)));
        const newTxn: Txn = {
          date: today(), type: "Outward", typeBadge: "amber", ref: issRef,
          batch: line.batch, expiry: line.expiry, qtyIn: "—",
          qtyOut: line.qty.toFixed(3), balance: newStock.toFixed(3), rate: line.rate || "—",
        };
        rm.currentStock = newStock;
        rm.txns = [...rm.txns, newTxn];
        updated[idx] = rm;
      }
      return updated;
    });
  };

  const inwardStock = (grnRef: string, lines: InwardLine[]) => {
    setRmData(prev => {
      const updated = [...prev];
      for (const line of lines) {
        const idx = updated.findIndex(r =>
          r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
          line.rmName.toLowerCase().includes(r.name.toLowerCase())
        );
        if (idx === -1 || line.qty <= 0) continue;
        const rm = { ...updated[idx] };
        const newStock = parseFloat((rm.currentStock + line.qty).toFixed(3));
        const newTxn: Txn = {
          date: today(), type: "Inward", typeBadge: "teal", ref: grnRef,
          batch: line.batch, expiry: line.expiry, qtyIn: line.qty.toFixed(3),
          qtyOut: "—", balance: newStock.toFixed(3), rate: line.rate || "—",
        };
        rm.currentStock = newStock;
        rm.txns = [...rm.txns, newTxn];
        updated[idx] = rm;
      }
      return updated;
    });
  };

  const addRM = (rm: Omit<RMEntry, "code" | "currentStock" | "txns">) => {
    setRmData(prev => {
      const maxNum = prev.reduce((max, r) => {
        const n = parseInt(r.code.replace("RM-", ""));
        return n > max ? n : max;
      }, 0);
      const code = `RM-${String(maxNum + 1).padStart(3, "0")}`;
      return [...prev, { ...rm, code, currentStock: 0, txns: [] }];
    });
  };

  const updateRM = (code: string, data: Partial<Omit<RMEntry, "code" | "currentStock" | "txns">>) => {
    setRmData(prev => prev.map(r => r.code === code ? { ...r, ...data } : r));
  };

  const deleteRM = (code: string) => {
    setRmData(prev => prev.filter(r => r.code !== code));
  };

  return (
    <StockContext.Provider value={{ rmData, getStockForRM, issueStock, inwardStock, addRM, updateRM, deleteRM }}>
      {children}
    </StockContext.Provider>
  );
};
