import { createContext, useContext, useState, ReactNode } from "react";

export type QCSpec = { parameter: string; spec: string; section?: string; unit?: string };

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
  /** Optional Hindi/Devanagari name shown alongside English everywhere. */
  nameHi?: string;
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

export type QCResult = {
  parameter: string;
  spec: string;
  section: string;
  unit: string;
  actual: string;
  pass: boolean | null; // null = not tested yet
};

export type PendingGRNLine = {
  rmCode: string;
  rmName: string;
  botanical: string;
  qty: number;
  batch: string;
  expiry: string;
  rate: string;
  uom: string;
  category: string;
  part: string;
  qcResults: QCResult[];
  qcStatus: "pending" | "in_test" | "approved" | "rejected" | "retest";
  disposition: "approve" | "retest" | "reject" | null;
  dispositionReason: string;
  sampleQty: string;
  sampleDrawnBy: string;
  sampleDrawnOn: string;
  arNo: string;
  analystRemarks: string;
  analystSigned: boolean;
  analystSignedAt: string | null;
  approverSigned: boolean;
  approverSignedAt: string | null;
};

export type PendingGRN = {
  grnNo: string;
  date: string;
  supplier: string;
  lines: PendingGRNLine[];
  status: "pending_qc" | "approved" | "rejected" | "partial";
};

export type GRNDraft = {
  id: string;
  grnNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  invoiceNo: string;
  invoiceDate: string;
  lines: {
    rmCode: string;
    rmName: string;
    botanical: string;
    uom: string;
    batch: string;
    expiry: string;
    qty: number;
    rate: string;
  }[];
  step: "entry" | "qc";
  savedAt: string;
};


export type IssuedRecord = {
  issRef: string;
  type: "batch" | "single";
  source: string; // BMR label or "Ad-hoc"
  date: string;
  lines: { rmName: string; botanical?: string; qty: number; uom: string; batch: string; expiry: string }[];
  status: "issued" | "reversed";
};

export type RMLot = {
  lotId: string;
  batchNo: string;       // e.g. VIB-2504-0001
  rmCode: string;
  rmName: string;
  grnRef: string;
  receivedDate: string;
  expiry: string;
  rate: string;
  qtyReceived: number;
  qtyRemaining: number;
  status: "active" | "exhausted" | "reversed";
};

export type LotAllocation = {
  lotId: string;
  batchNo: string;
  expiry: string;
  rate: string;
  qty: number;
};

const initialData: RMEntry[] = [
  {
    code: "RM-001", name: "Ashwagandha", nameHi: "अश्वगंधा", botanical: "Withania somnifera", category: "Herb", part: "Root", uom: "kg", reorder: 5, shelf: "36 mo", active: true, currentStock: 1.2,
    qcSpecs: [
      // Organoleptic
      { parameter: "Colour", spec: "Pale yellow to brown", section: "Organoleptic", unit: "" },
      { parameter: "Odour", spec: "Characteristic, horse-like", section: "Organoleptic", unit: "" },
      { parameter: "Taste", spec: "Bitter, acrid", section: "Organoleptic", unit: "" },
      { parameter: "Texture / foreign matter", spec: "Free from foreign matter", section: "Organoleptic", unit: "" },
      // Physicochemical
      { parameter: "Moisture content", spec: "NMT 10.0%", section: "Physicochemical", unit: "%" },
      { parameter: "Total ash", spec: "NMT 10.0%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Acid-insoluble ash", spec: "NMT 1.0%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Water-soluble extractive", spec: "NLT 15.0%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Alcohol-soluble extractive", spec: "NLT 10.0%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "pH (10% aqueous)", spec: "4.5 – 6.5", section: "Physicochemical", unit: "" },
      // Identity & assay
      { parameter: "TLC fingerprint (withanolides)", spec: "Match reference standard", section: "Identity & Assay", unit: "Rf value" },
      { parameter: "Withanolide content (HPLC)", spec: "NLT 0.3% w/w", section: "Identity & Assay", unit: "% w/w" },
      { parameter: "Microscopic identification", spec: "Characteristic elements present", section: "Identity & Assay", unit: "" },
      // Safety
      { parameter: "Lead (Pb)", spec: "NMT 10 ppm", section: "Safety", unit: "ppm" },
      { parameter: "Cadmium (Cd)", spec: "NMT 0.3 ppm", section: "Safety", unit: "ppm" },
      { parameter: "Mercury (Hg)", spec: "NMT 1.0 ppm", section: "Safety", unit: "ppm" },
      { parameter: "Arsenic (As)", spec: "NMT 3.0 ppm", section: "Safety", unit: "ppm" },
      { parameter: "Total aerobic microbial count", spec: "NMT 10⁵ CFU/g", section: "Safety", unit: "CFU/g" },
      { parameter: "Total yeast & mould count", spec: "NMT 10³ CFU/g", section: "Safety", unit: "CFU/g" },
      { parameter: "E. coli / Salmonella", spec: "Absent per g", section: "Safety", unit: "" },
      { parameter: "Pesticide residues (organochlorine)", spec: "NMT 1 ppm (WHO 2007)", section: "Safety", unit: "ppm" },
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
    code: "RM-002", name: "Amalaki / Amla", nameHi: "आमलकी / आँवला", botanical: "Emblica officinalis", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 10, shelf: "24 mo", active: true, currentStock: 14.5,
    qcSpecs: [
      { parameter: "Colour", spec: "Greenish-brown", section: "Organoleptic", unit: "" },
      { parameter: "Odour", spec: "Characteristic sour", section: "Organoleptic", unit: "" },
      { parameter: "Foreign matter", spec: "NMT 2%", section: "Physicochemical", unit: "%" },
      { parameter: "Total ash", spec: "NMT 5%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Moisture", spec: "NMT 9%", section: "Physicochemical", unit: "%" },
      { parameter: "Vitamin C content", spec: "NLT 0.4%", section: "Identity & Assay", unit: "% w/w" },
      { parameter: "Lead (Pb)", spec: "NMT 10 ppm", section: "Safety", unit: "ppm" },
      { parameter: "Total aerobic microbial count", spec: "NMT 10⁵ CFU/g", section: "Safety", unit: "CFU/g" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "12.000", qtyOut: "—", balance: "12.000", rate: "—" },
      { date: "18 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0115", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "15.000", qtyOut: "—", balance: "27.000", rate: "180" },
      { date: "02 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0062", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "—", qtyOut: "8.000", balance: "19.000", rate: "180" },
      { date: "28 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0075", batch: "AR/2025-115", expiry: "Apr 2027", qtyIn: "—", qtyOut: "4.500", balance: "14.500", rate: "180" },
    ],
  },
  {
    code: "RM-003", name: "Haritaki", nameHi: "हरीतकी", botanical: "Terminalia chebula", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 8, shelf: "24 mo", active: true, currentStock: 6.0,
    qcSpecs: [
      { parameter: "Colour", spec: "Dark brown", section: "Organoleptic", unit: "" },
      { parameter: "Foreign matter", spec: "NMT 2%", section: "Physicochemical", unit: "%" },
      { parameter: "Total ash", spec: "NMT 5%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Moisture", spec: "NMT 10%", section: "Physicochemical", unit: "%" },
      { parameter: "Lead (Pb)", spec: "NMT 10 ppm", section: "Safety", unit: "ppm" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "10.000", qtyOut: "—", balance: "10.000", rate: "—" },
      { date: "12 Apr 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0049", batch: "AR/2025-049", expiry: "Feb 2027", qtyIn: "—", qtyOut: "4.000", balance: "6.000", rate: "220" },
    ],
  },
  {
    code: "RM-004", name: "Vibhitaki", nameHi: "विभीतकी", botanical: "Terminalia bellirica", category: "Herb", part: "Fruit rind", uom: "kg", reorder: 5, shelf: "24 mo", active: true, currentStock: 0,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "NMT 2%", section: "Physicochemical", unit: "%" },
      { parameter: "Total ash", spec: "NMT 5%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Moisture", spec: "NMT 10%", section: "Physicochemical", unit: "%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "3.000", qtyOut: "—", balance: "3.000", rate: "—" },
      { date: "20 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0069", batch: "AR/2025-050", expiry: "Jan 2027", qtyIn: "—", qtyOut: "3.000", balance: "0.000", rate: "200" },
    ],
  },
  {
    code: "RM-012", name: "Shuddha Guggulu", nameHi: "शुद्ध गुग्गुलु", botanical: "Commiphora wightii", category: "Extract", part: "Purified resin", uom: "kg", reorder: 3, shelf: "60 mo", active: true, currentStock: 4.8,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "NMT 1%", section: "Physicochemical", unit: "%" },
      { parameter: "Moisture", spec: "NMT 20%", section: "Physicochemical", unit: "%" },
      { parameter: "Ethanol-soluble extractive", spec: "NLT 25%", section: "Physicochemical", unit: "%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "3.000", qtyOut: "—", balance: "3.000", rate: "—" },
      { date: "20 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0120", batch: "AR/2025-120", expiry: "Apr 2030", qtyIn: "5.000", qtyOut: "—", balance: "8.000", rate: "2800" },
      { date: "15 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0068", batch: "AR/2025-120", expiry: "Apr 2030", qtyIn: "—", qtyOut: "3.200", balance: "4.800", rate: "2800" },
    ],
  },
  {
    code: "RM-027", name: "Abhraka (Shuddha)", nameHi: "अभ्रक (शुद्ध)", botanical: "Mica / Biotite", category: "Metal/Mineral", part: "Shodhita flakes", uom: "kg", reorder: 0.5, shelf: "Indef.", active: true, currentStock: 0.35,
    qcSpecs: [
      { parameter: "Loss on ignition", spec: "NMT 2%", section: "Physicochemical", unit: "%" },
      { parameter: "Iron content", spec: "Pass", section: "Identity & Assay", unit: "" },
      { parameter: "Particle size", spec: "All passes #120 mesh", section: "Physicochemical", unit: "" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "0.500", qtyOut: "—", balance: "0.500", rate: "—" },
      { date: "05 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0065", batch: "AR/2025-044", expiry: "Indef.", qtyIn: "—", qtyOut: "0.150", balance: "0.350", rate: "3500" },
    ],
  },
  {
    code: "RM-031", name: "Cow ghee", nameHi: "गोघृत", botanical: "Clarified butter (Ghrita)", category: "Animal", part: "Clarified butter", uom: "L", reorder: 5, shelf: "16 mo", active: true, currentStock: 8.0,
    qcSpecs: [
      { parameter: "Rancidity (Kreis test)", spec: "Negative", section: "Physicochemical", unit: "" },
      { parameter: "Butyro refractometer reading (40°C)", spec: "40–44", section: "Physicochemical", unit: "" },
      { parameter: "Moisture", spec: "NMT 0.5%", section: "Physicochemical", unit: "%" },
    ],
    txns: [
      { date: "01 Apr 2025", type: "Opening", typeBadge: "gray", ref: "—", batch: "—", expiry: "—", qtyIn: "4.000", qtyOut: "—", balance: "4.000", rate: "—" },
      { date: "10 Apr 2025", type: "Inward", typeBadge: "teal", ref: "GRN-2025-0108", batch: "AR/2025-108", expiry: "Aug 2026", qtyIn: "10.000", qtyOut: "—", balance: "14.000", rate: "650" },
      { date: "25 May 2025", type: "Outward", typeBadge: "amber", ref: "ISS-2025-0073", batch: "AR/2025-108", expiry: "Aug 2026", qtyIn: "—", qtyOut: "6.000", balance: "8.000", rate: "650" },
    ],
  },
  {
    code: "RM-044", name: "Dhataki Pushpa", nameHi: "धातकी पुष्प", botanical: "Woodfordia fruticosa", category: "Herb", part: "Flower", uom: "kg", reorder: 1, shelf: "18 mo", active: true, currentStock: 0.6,
    qcSpecs: [
      { parameter: "Foreign matter", spec: "NMT 3%", section: "Physicochemical", unit: "%" },
      { parameter: "Total ash", spec: "NMT 6%", section: "Physicochemical", unit: "% w/w" },
      { parameter: "Moisture", spec: "NMT 10%", section: "Physicochemical", unit: "%" },
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
  issueStock: (issRef: string, lines: IssueLine[], meta?: { type: "batch" | "single"; source: string }) => void;
  reverseIssue: (issRef: string) => void;
  issuedRecords: IssuedRecord[];
  inwardStock: (grnRef: string, lines: InwardLine[]) => void;
  addRM: (rm: Omit<RMEntry, "code" | "currentStock" | "txns">) => void;
  updateRM: (code: string, data: Partial<Omit<RMEntry, "code" | "currentStock" | "txns">>) => void;
  deleteRM: (code: string) => void;
  getNextGRN: () => { nextGRN: string; prevGRN: string | null };
  grnCount: number;
  incrementGRN: () => void;
  // QC workflow
  pendingGRNs: PendingGRN[];
  submitForQC: (grn: PendingGRN) => void;
  updateQCResult: (grnNo: string, lineIdx: number, paramIdx: number, actual: string, pass: boolean | null) => void;
  updateQCLineField: (grnNo: string, lineIdx: number, field: Partial<PendingGRNLine>) => void;
  approveGRNLine: (grnNo: string, lineIdx: number) => void;
  rejectGRNLine: (grnNo: string, lineIdx: number) => void;
  finalApproveGRN: (grnNo: string) => void;
  reverseGRN: (grnNo: string) => void;
  updateGRNData: (grnNo: string, data: Partial<PendingGRN>) => void;
  // Draft management
  drafts: GRNDraft[];
  saveDraft: (draft: GRNDraft) => void;
  deleteDraft: (id: string) => void;
  // Lots & FIFO
  lots: RMLot[];
  getNextRMBatchNo: (rmCode: string, rmName: string) => { batchNo: string; prevBatchNo: string | null };
  getActiveLotsForRM: (rmCode: string) => RMLot[];
  consumeFromLots: (rmCode: string, qty: number) => { allocations: LotAllocation[]; shortfall: number };
  commitConsumption: (issRef: string, source: string, rmCode: string, rmName: string, allocations: LotAllocation[]) => void;
  reverseConsumption: (issRef: string) => void;
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
  const [grnCount, setGrnCount] = useState(187);
  const [pendingGRNs, setPendingGRNs] = useState<PendingGRN[]>([]);
  const [issuedRecords, setIssuedRecords] = useState<IssuedRecord[]>([]);
  const [lots, setLots] = useState<RMLot[]>([]);
  const [drafts, setDrafts] = useState<GRNDraft[]>(() => {
    try {
      const stored = localStorage.getItem("grn_drafts");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const persistDrafts = (d: GRNDraft[]) => {
    setDrafts(d);
    localStorage.setItem("grn_drafts", JSON.stringify(d));
  };

  const saveDraft = (draft: GRNDraft) => {
    persistDrafts([...drafts.filter(d => d.id !== draft.id), { ...draft, savedAt: new Date().toLocaleString("en-IN") }]);
  };

  const deleteDraft = (id: string) => {
    persistDrafts(drafts.filter(d => d.id !== id));
  };

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
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean);
    const searchTokens = normalize(name);
    const rm = rmData.find(r => {
      const rmTokens = normalize(r.name);
      // Match if any search token appears in any rm token or vice versa
      return searchTokens.some(st => rmTokens.some(rt => rt.includes(st) || st.includes(rt))) ||
        r.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(r.name.toLowerCase()) ||
        r.code.toLowerCase() === name.toLowerCase();
    });
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

  const issueStock = (issRef: string, lines: IssueLine[], meta?: { type: "batch" | "single"; source: string }) => {
    setRmData(prev => {
      const updated = [...prev];
      for (const line of lines) {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean);
        const searchTokens = normalize(line.rmName);
        const idx = updated.findIndex(r => {
          const rmTokens = normalize(r.name);
          return searchTokens.some(st => rmTokens.some(rt => rt.includes(st) || st.includes(rt))) ||
            r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
            line.rmName.toLowerCase().includes(r.name.toLowerCase());
        });
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
    // Record the issue
    if (meta) {
      const record: IssuedRecord = {
        issRef,
        type: meta.type,
        source: meta.source,
        date: today(),
        lines: lines.map(l => {
          const rm = rmData.find(r => r.name.toLowerCase().includes(l.rmName.toLowerCase()) || l.rmName.toLowerCase().includes(r.name.toLowerCase()));
          return { rmName: l.rmName, botanical: rm?.botanical, qty: l.qty, uom: rm?.uom || "kg", batch: l.batch, expiry: l.expiry };
        }),
        status: "issued",
      };
      setIssuedRecords(prev => [...prev, record]);
    }
  };

  const reverseIssue = (issRef: string) => {
    const record = issuedRecords.find(r => r.issRef === issRef && r.status === "issued");
    if (!record) return;
    // Reverse outward txns
    setRmData(prev => {
      const updated = [...prev];
      for (const line of record.lines) {
        const idx = updated.findIndex(r =>
          r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
          line.rmName.toLowerCase().includes(r.name.toLowerCase())
        );
        if (idx === -1) continue;
        const rm = { ...updated[idx] };
        const removedTxns = rm.txns.filter(t => t.ref === issRef && t.type === "Outward");
        const reversedQty = removedTxns.reduce((sum, t) => sum + parseFloat(t.qtyOut === "—" ? "0" : t.qtyOut), 0);
        rm.txns = rm.txns.filter(t => !(t.ref === issRef && t.type === "Outward"));
        rm.currentStock = parseFloat((rm.currentStock + reversedQty).toFixed(3));
        // Recalculate running balances
        let balance = 0;
        rm.txns = rm.txns.map(t => {
          const inAmt = t.qtyIn === "—" ? 0 : parseFloat(t.qtyIn);
          const outAmt = t.qtyOut === "—" ? 0 : parseFloat(t.qtyOut);
          balance = parseFloat((balance + inAmt - outAmt).toFixed(3));
          return { ...t, balance: balance.toFixed(3) };
        });
        updated[idx] = rm;
      }
      return updated;
    });
    // Mark record as reversed
    setIssuedRecords(prev => prev.map(r => r.issRef === issRef ? { ...r, status: "reversed" as const } : r));
  };

  // Direct inward (kept for backward compat but now only called after QC approval)
  const inwardStock = (grnRef: string, lines: InwardLine[]) => {
    setRmData(prev => {
      const updated = [...prev];
      for (const line of lines) {
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean);
        const searchTokens = normalize(line.rmName);
        const idx = updated.findIndex(r => {
          const rmTokens = normalize(r.name);
          return searchTokens.some(st => rmTokens.some(rt => rt.includes(st) || st.includes(rt))) ||
            r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
            line.rmName.toLowerCase().includes(r.name.toLowerCase());
        });
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

  // QC Workflow
  const submitForQC = (grn: PendingGRN) => {
    setPendingGRNs(prev => [...prev, grn]);
  };

  const updateQCResult = (grnNo: string, lineIdx: number, paramIdx: number, actual: string, pass: boolean | null) => {
    setPendingGRNs(prev => prev.map(g => {
      if (g.grnNo !== grnNo) return g;
      const lines = [...g.lines];
      const line = { ...lines[lineIdx] };
      const qcResults = [...line.qcResults];
      qcResults[paramIdx] = { ...qcResults[paramIdx], actual, pass };
      line.qcResults = qcResults;
      // Auto-set status to in_test if any results entered
      if (line.qcStatus === "pending") line.qcStatus = "in_test";
      lines[lineIdx] = line;
      return { ...g, lines };
    }));
  };

  const updateQCLineField = (grnNo: string, lineIdx: number, field: Partial<PendingGRNLine>) => {
    setPendingGRNs(prev => prev.map(g => {
      if (g.grnNo !== grnNo) return g;
      const lines = [...g.lines];
      lines[lineIdx] = { ...lines[lineIdx], ...field };
      return { ...g, lines };
    }));
  };

  const approveGRNLine = (grnNo: string, lineIdx: number) => {
    setPendingGRNs(prev => prev.map(g => {
      if (g.grnNo !== grnNo) return g;
      const lines = [...g.lines];
      lines[lineIdx] = { ...lines[lineIdx], qcStatus: "approved" };
      // Update overall GRN status
      const allDone = lines.every(l => l.qcStatus === "approved" || l.qcStatus === "rejected");
      const allApproved = lines.every(l => l.qcStatus === "approved");
      const status = allDone ? (allApproved ? "approved" : "partial") : "pending_qc";
      return { ...g, lines, status };
    }));
  };

  const rejectGRNLine = (grnNo: string, lineIdx: number) => {
    setPendingGRNs(prev => prev.map(g => {
      if (g.grnNo !== grnNo) return g;
      const lines = [...g.lines];
      lines[lineIdx] = { ...lines[lineIdx], qcStatus: "rejected" };
      const allDone = lines.every(l => l.qcStatus === "approved" || l.qcStatus === "rejected");
      const allApproved = lines.every(l => l.qcStatus === "approved");
      const status = allDone ? (allApproved ? "approved" : "partial") : "pending_qc";
      return { ...g, lines, status };
    }));
  };

  const finalApproveGRN = (grnNo: string) => {
    const grn = pendingGRNs.find(g => g.grnNo === grnNo);
    if (!grn) return;
    // Only inward approved lines
    const approvedLines = grn.lines.filter(l => l.disposition === "approve" || l.qcStatus === "approved");
    if (approvedLines.length > 0) {
      inwardStock(grnNo, approvedLines.map(l => ({
        rmName: l.rmName, qty: l.qty, batch: l.batch, expiry: l.expiry, rate: l.rate,
      })));
      // Create RMLot per approved line for FIFO tracking
      const newLots: RMLot[] = approvedLines.map(l => ({
        lotId: crypto.randomUUID(),
        batchNo: l.batch || `${l.rmName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()}-AUTO-${Date.now()}`,
        rmCode: l.rmCode,
        rmName: l.rmName,
        grnRef: grnNo,
        receivedDate: new Date().toISOString(),
        expiry: l.expiry,
        rate: l.rate,
        qtyReceived: l.qty,
        qtyRemaining: l.qty,
        status: "active" as const,
      }));
      setLots(prev => [...prev, ...newLots]);
    }
    // Mark GRN as done
    setPendingGRNs(prev => prev.map(g =>
      g.grnNo === grnNo ? { ...g, status: "approved" } : g
    ));
  };

  // Reverse a finalized GRN — undo stock ledger entries
  const reverseGRN = (grnNo: string) => {
    // Block reversal if any lot from this GRN has been consumed
    const grnLots = lots.filter(l => l.grnRef === grnNo);
    const partiallyConsumed = grnLots.some(l => l.qtyRemaining < l.qtyReceived);
    if (partiallyConsumed) {
      console.warn(`Cannot reverse GRN ${grnNo}: some lots already consumed in BMRs.`);
      return;
    }
    // Remove lots from this GRN
    setLots(prev => prev.filter(l => l.grnRef !== grnNo));
    const grn = pendingGRNs.find(g => g.grnNo === grnNo);
    if (!grn) return;
    // Remove inward txns for this GRN from rmData
    setRmData(prev => {
      const updated = [...prev];
      for (const line of grn.lines.filter(l => l.qcStatus === "approved")) {
        const idx = updated.findIndex(r =>
          r.name.toLowerCase().includes(line.rmName.toLowerCase()) ||
          line.rmName.toLowerCase().includes(r.name.toLowerCase())
        );
        if (idx === -1) continue;
        const rm = { ...updated[idx] };
        // Remove txns matching this GRN ref
        const removedTxns = rm.txns.filter(t => t.ref === grnNo && t.type === "Inward");
        const reversedQty = removedTxns.reduce((sum, t) => sum + parseFloat(t.qtyIn === "—" ? "0" : t.qtyIn), 0);
        rm.txns = rm.txns.filter(t => !(t.ref === grnNo && t.type === "Inward"));
        rm.currentStock = parseFloat((rm.currentStock - reversedQty).toFixed(3));
        // Recalculate running balances
        let balance = 0;
        rm.txns = rm.txns.map(t => {
          const inAmt = t.qtyIn === "—" ? 0 : parseFloat(t.qtyIn);
          const outAmt = t.qtyOut === "—" ? 0 : parseFloat(t.qtyOut);
          balance = parseFloat((balance + inAmt - outAmt).toFixed(3));
          return { ...t, balance: balance.toFixed(3) };
        });
        updated[idx] = rm;
      }
      return updated;
    });
    // Reset GRN back to pending_qc so it can be re-edited
    setPendingGRNs(prev => prev.map(g =>
      g.grnNo === grnNo ? {
        ...g,
        status: "pending_qc" as const,
        lines: g.lines.map(l => ({
          ...l,
          qcStatus: "pending" as const,
          disposition: null,
          dispositionReason: "",
          analystSigned: false,
          analystSignedAt: null,
          approverSigned: false,
          approverSignedAt: null,
          qcResults: l.qcResults.map(r => ({ ...r, actual: "", pass: null })),
        })),
      } : g
    ));
  };

  const updateGRNData = (grnNo: string, data: Partial<PendingGRN>) => {
    setPendingGRNs(prev => prev.map(g =>
      g.grnNo === grnNo ? { ...g, ...data } : g
    ));
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

  // ==== Lot / FIFO management ====

  const getNextRMBatchNo = (rmCode: string, rmName: string): { batchNo: string; prevBatchNo: string | null } => {
    const prefix = rmName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "RM";
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const pattern = new RegExp(`^${prefix}-${yymm}-(\\d+)$`);
    const rmLots = lots.filter(l => l.rmCode === rmCode);
    let maxSeq = 0;
    let prevBatchNo: string | null = null;
    for (const lot of rmLots) {
      const m = lot.batchNo.match(pattern);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxSeq) { maxSeq = n; prevBatchNo = lot.batchNo; }
      }
    }
    if (!prevBatchNo && rmLots.length > 0) prevBatchNo = rmLots[rmLots.length - 1].batchNo;
    const seq = String(maxSeq + 1).padStart(4, "0");
    return { batchNo: `${prefix}-${yymm}-${seq}`, prevBatchNo };
  };

  const getActiveLotsForRM = (rmCode: string): RMLot[] => {
    return lots
      .filter(l => l.rmCode === rmCode && l.status === "active" && l.qtyRemaining > 0)
      .sort((a, b) => a.receivedDate.localeCompare(b.receivedDate));
  };

  const consumeFromLots = (rmCode: string, qty: number): { allocations: LotAllocation[]; shortfall: number } => {
    const active = getActiveLotsForRM(rmCode);
    const allocations: LotAllocation[] = [];
    let need = qty;
    for (const lot of active) {
      if (need <= 0.0001) break;
      const take = Math.min(lot.qtyRemaining, need);
      allocations.push({ lotId: lot.lotId, batchNo: lot.batchNo, expiry: lot.expiry, rate: lot.rate, qty: parseFloat(take.toFixed(3)) });
      need = parseFloat((need - take).toFixed(3));
    }
    return { allocations, shortfall: Math.max(0, parseFloat(need.toFixed(3))) };
  };

  const commitConsumption = (issRef: string, source: string, rmCode: string, rmName: string, allocations: LotAllocation[]) => {
    if (!allocations.length) return;
    // Drawdown lots
    setLots(prev => prev.map(l => {
      const a = allocations.find(x => x.lotId === l.lotId);
      if (!a) return l;
      const remaining = parseFloat((l.qtyRemaining - a.qty).toFixed(3));
      return { ...l, qtyRemaining: Math.max(0, remaining), status: remaining <= 0.0001 ? "exhausted" as const : l.status };
    }));
    // Outward txn per lot on RMEntry
    setRmData(prev => prev.map(rm => {
      if (rm.code !== rmCode) return rm;
      let stock = rm.currentStock;
      const newTxns: Txn[] = allocations.map(a => {
        stock = parseFloat((stock - a.qty).toFixed(3));
        return {
          date: today(), type: "Outward", typeBadge: "amber", ref: issRef,
          batch: a.batchNo, expiry: a.expiry, qtyIn: "—",
          qtyOut: a.qty.toFixed(3), balance: stock.toFixed(3), rate: a.rate || "—",
        };
      });
      return { ...rm, currentStock: Math.max(0, stock), txns: [...rm.txns, ...newTxns] };
    }));
    // Append to issuedRecords
    setIssuedRecords(prev => [...prev, {
      issRef, type: "batch", source, date: today(),
      lines: allocations.map(a => ({ rmName, qty: a.qty, uom: "", batch: a.batchNo, expiry: a.expiry })),
      status: "issued",
    }]);
  };

  const reverseConsumption = (issRef: string) => {
    // Restore lot qtyRemaining by summing allocations from txns matching ref
    setRmData(prev => prev.map(rm => {
      const outs = rm.txns.filter(t => t.ref === issRef && t.type === "Outward");
      if (!outs.length) return rm;
      const restored = outs.reduce((s, t) => s + parseFloat(t.qtyOut === "—" ? "0" : t.qtyOut), 0);
      const txns = rm.txns.filter(t => !(t.ref === issRef && t.type === "Outward"));
      let bal = 0;
      const recalced = txns.map(t => {
        const i = t.qtyIn === "—" ? 0 : parseFloat(t.qtyIn);
        const o = t.qtyOut === "—" ? 0 : parseFloat(t.qtyOut);
        bal = parseFloat((bal + i - o).toFixed(3));
        return { ...t, balance: bal.toFixed(3) };
      });
      // restore lots
      setLots(prevLots => prevLots.map(l => {
        const matched = outs.find(t => t.batch === l.batchNo);
        if (!matched) return l;
        const back = parseFloat(matched.qtyOut === "—" ? "0" : matched.qtyOut);
        const newRemaining = parseFloat((l.qtyRemaining + back).toFixed(3));
        return { ...l, qtyRemaining: newRemaining, status: newRemaining > 0 ? "active" as const : l.status };
      }));
      return { ...rm, currentStock: parseFloat((rm.currentStock + restored).toFixed(3)), txns: recalced };
    }));
    setIssuedRecords(prev => prev.map(r => r.issRef === issRef ? { ...r, status: "reversed" as const } : r));
  };

  return (
    <StockContext.Provider value={{
      rmData, getStockForRM, issueStock, reverseIssue, issuedRecords, inwardStock, addRM, updateRM, deleteRM,
      getNextGRN, grnCount, incrementGRN,
      pendingGRNs, submitForQC, updateQCResult, updateQCLineField, approveGRNLine, rejectGRNLine, finalApproveGRN,
      reverseGRN, updateGRNData,
      drafts, saveDraft, deleteDraft,
      lots, getNextRMBatchNo, getActiveLotsForRM, consumeFromLots, commitConsumption, reverseConsumption,
    }}>
      {children}
    </StockContext.Provider>
  );
};
