import { createContext, useContext, useState, ReactNode } from "react";

export interface BMRLotAllocation {
  lotId: string;
  batchNo: string;
  expiry: string;
  rate: string;
  qty: number;
}

export interface BMRIngredient {
  name: string;
  /** Optional Hindi/Devanagari name (snapshot from RM master at BMR creation). */
  nameHi?: string;
  rmCode?: string;
  cat: string;
  requiredQty: number;
  actualQty: number;
  unit: string;
  part: string;
  lot: string;
  cost: number;
  botanicalName?: string;
  arControlNo?: string;
  grnRef?: string;
  expiry?: string;
  weighedBy?: string;
  checkedBy?: string;
  allocations?: BMRLotAllocation[];
  shortfall?: number;
  consumed?: boolean;
}

export interface BMRProcessStep {
  step: string;
  description?: string;
  equipment?: string;
  duration?: string;
  temp?: string;
  humidity?: string;
  ipcCheck?: string;
  status: "done" | "current" | "todo";
  operator?: string;
  startTime?: string;
  endTime?: string;
  remarks?: string;
}

export interface BMRIPCCheck {
  check: string;
  description?: string;
  specification: string;
  observedValue: string;
  unit: string;
  checkedAt: string;
  result: "pass" | "fail" | "";
}

export interface BMRPersonnel {
  preparedBy: string;
  technicalStaff: string;
  qcHead: string;
  productionSupervisor: string;
  roomPlant: string;
  equipmentUsed: string;
}

export interface BMREnvironment {
  roomTemp: string;
  relativeHumidity: string;
  roomPressure: string;
  hvacUnit: string;
}

export interface BMRBlendWeight {
  theoreticalBlendWt: string;
  actualBlendWt: string;
  lossOnBlending: string;
  yieldAtBlendStage: string;
}

export interface BMRPackEntry {
  primaryPackSize: string;
  noOfPrimaryPacks: number;
  secondaryPack: string;
  noOfShippers: number;
  qtyAllocated: number; // batch quantity allocated to this pack size (in batchUnit)
}

export interface BMRPacking {
  // Legacy single-pack fields (kept for backwards compatibility / label code)
  primaryPackSize: string;
  noOfPrimaryPacks: number;
  totalQtyPacked: string;
  qcRetainSample: string;
  secondaryPack: string;
  noOfShippers: number;
  labellingBatchCode: string;
  packingDate: string;
  // New: multiple pack sizes per batch
  packEntries?: BMRPackEntry[];
}

export interface BMRLabel {
  approvedBy: string;
  approvalDate: string;
  batchCodeVerified: boolean;
  mrp: string;
}

export interface BMRWarehouseTransfer {
  qtyToWarehouse: string;
  warehouseLocation: string;
  transferDate: string;
  transferAcknowledgedBy: string;
}

export interface BMRQCTest {
  parameter: string;
  spec: string;
  result: string;
  compliance: "pass" | "fail" | "";
}

export type BMRSubProcessType = "Kwatha" | "Kalka" | "Bhavana" | "Shodhana" | "Other";

export interface BMRSubProcessIterationLog {
  date: string;
  cycleNo: number;
  weightAfter: string;
  observedByPin: string;
}

export interface BMRSubProcess {
  id: string;
  type: BMRSubProcessType;
  name: string;
  description: string;
  ingredients: BMRIngredient[];
  // Template fields (snapshot from MFR — readonly in UI)
  waterRatio?: string;
  reductionTarget?: string;
  numberOfCycles?: number;
  yieldQty?: number;
  yieldUnit?: string;
  completionTest?: string;
  notes?: string;
  // Per-batch actuals
  actualYield?: string;
  actualYieldUnit?: string;
  completionTestResult?: "Pass" | "Fail" | "";
  observedBy?: string;
  date?: string;
  batchNotes?: string;
  // Kwatha specific
  initialVolume?: string;
  finalVolume?: string;
  pakaDuration?: string;
  flameSetting?: string;
  // Bhavana / Shodhana
  iterationLog?: BMRSubProcessIterationLog[];
}
  name: string;
  initials: string;
  role: string;
  signed: boolean;
  signedAt?: string;
  color: string;
}

export interface BMRRecord {
  id: string;
  batchNo: string;
  productName: string;
  /** Optional Hindi/Devanagari product name (snapshot from MFR at BMR creation). */
  productNameHi?: string;
  mfrId: string;
  mfrName: string;
  batchSize: number;
  batchUnit: string;
  scaleFactor: number;
  startDate: string;
  completionDate: string;
  status: "Draft" | "In process" | "QC pending" | "Released" | "Rejected";
  ingredients: BMRIngredient[];
  steps: BMRProcessStep[];
  ipcChecks: BMRIPCCheck[];
  qcParams: BMRQCTest[];
  theoreticalYield: number;
  actualYield: number;
  yieldPct: number;
  createdAt: string;

  // Step 1 extended
  dosageForm: string;
  mfrRef: string;
  pharmacopoeiaRef: string;
  licenceNo: string;
  productCode: string;
  lotNumber: string;
  shelfLifeMonths: number;
  expiryDate: string;
  personnel: BMRPersonnel;

  // Step 3 extended
  environment: BMREnvironment;
  blendWeight: BMRBlendWeight;

  // Step 5
  packing: BMRPacking;
  label: BMRLabel;
  warehouseTransfer: BMRWarehouseTransfer;

  // Step 6
  arReportNo: string;
  dateSampleSentToQC: string;
  dateOfAnalysis: string;
  analystOverallResult: string;
  analystRemarks: string;
  rejectionInBatch: string;
  batchesWithdrawn: string;
  disposalRef: string;
  signatures: BMRSignature[];
  checklist: Record<string, boolean>;
  released: boolean;

  // Wizard tracking
  currentStep: number;
}

interface BMRContextType {
  bmrs: BMRRecord[];
  addBMR: (bmr: BMRRecord) => void;
  updateBMR: (id: string, updates: Partial<BMRRecord>) => void;
  getBMR: (id: string) => BMRRecord | undefined;
  /**
   * Generate the next batch number for a formulation.
   * Pass `batchPrefix` (resolved & stored on the MFR) for collision-free prefixes.
   * Falls back to deriving from `productName` only if no prefix is supplied.
   */
  getNextBatchNo: (
    productName: string,
    mfrId: string,
    batchPrefix?: string,
  ) => { nextBatchNo: string; prevBatchNo: string | null };
}

const BMRContext = createContext<BMRContextType | null>(null);

export const useBMRs = () => {
  const ctx = useContext(BMRContext);
  if (!ctx) throw new Error("useBMRs must be used within BMRProvider");
  return ctx;
};

export function createDefaultBMR(overrides: Partial<BMRRecord> = {}): BMRRecord {
  return {
    id: crypto.randomUUID(),
    batchNo: "",
    productName: "",
    mfrId: "",
    mfrName: "",
    batchSize: 0,
    batchUnit: "kg",
    scaleFactor: 0,
    startDate: new Date().toISOString().split("T")[0],
    completionDate: "",
    status: "In process",
    ingredients: [],
    steps: [],
    ipcChecks: [],
    qcParams: [],
    theoreticalYield: 0,
    actualYield: 0,
    yieldPct: 0,
    createdAt: new Date().toISOString().split("T")[0],
    dosageForm: "",
    mfrRef: "",
    pharmacopoeiaRef: "",
    licenceNo: "",
    productCode: "",
    lotNumber: "",
    shelfLifeMonths: 24,
    expiryDate: "",
    personnel: { preparedBy: "", technicalStaff: "", qcHead: "", productionSupervisor: "", roomPlant: "", equipmentUsed: "" },
    environment: { roomTemp: "", relativeHumidity: "", roomPressure: "Positive", hvacUnit: "" },
    blendWeight: { theoreticalBlendWt: "", actualBlendWt: "", lossOnBlending: "", yieldAtBlendStage: "" },
    packing: { primaryPackSize: "100 g HDPE jar", noOfPrimaryPacks: 0, totalQtyPacked: "", qcRetainSample: "20", secondaryPack: "", noOfShippers: 0, labellingBatchCode: "", packingDate: "" },
    label: { approvedBy: "", approvalDate: "", batchCodeVerified: false, mrp: "" },
    warehouseTransfer: { qtyToWarehouse: "", warehouseLocation: "", transferDate: "", transferAcknowledgedBy: "" },
    arReportNo: "",
    dateSampleSentToQC: "",
    dateOfAnalysis: "",
    analystOverallResult: "Standard quality — complies",
    analystRemarks: "",
    rejectionInBatch: "No",
    batchesWithdrawn: "No",
    disposalRef: "",
    signatures: [
      { name: "", initials: "", role: "Competent technical staff — manufacture", signed: false, color: "teal" },
      { name: "", initials: "", role: "Competent technical staff — QC verification", signed: false, color: "teal" },
      { name: "", initials: "", role: "QC Analyst — testing & analysis", signed: false, color: "blue" },
      { name: "", initials: "", role: "Head of QC — countersignature & final release", signed: false, color: "purple" },
    ],
    checklist: {
      "Batch header complete": false,
      "All ingredients weighed & countersigned": false,
      "Process log complete with env. controls": false,
      "All IPC checks recorded & passed": false,
      "Yield recorded & ≥ 95%": false,
      "Label specimen verified": false,
      "Analytical report completed": false,
      "QC head countersignature obtained": false,
    },
    released: false,
    currentStep: 1,
    ...overrides,
  };
}

export const BMRProvider = ({ children }: { children: ReactNode }) => {
  const [bmrs, setBMRs] = useState<BMRRecord[]>([]);

  const addBMR = (bmr: BMRRecord) => setBMRs((prev) => [...prev, bmr]);

  const updateBMR = (id: string, updates: Partial<BMRRecord>) =>
    setBMRs((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const getBMR = (id: string) => bmrs.find((b) => b.id === id);

  const getNextBatchNo = (
    productName: string,
    mfrId: string,
    batchPrefix?: string,
  ): { nextBatchNo: string; prevBatchNo: string | null } => {
    const fallback = productName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "BAT";
    const prefix = (batchPrefix && batchPrefix.trim()) ? batchPrefix.trim().toUpperCase() : fallback;
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const pattern = new RegExp(`^${prefix}-${yymm}-(\\d+)$`);

    const productBmrs = bmrs.filter((b) => b.mfrId === mfrId);
    let maxSeq = 0;
    let prevBatchNo: string | null = null;

    for (const b of productBmrs) {
      const match = b.batchNo.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
          prevBatchNo = b.batchNo;
        }
      }
    }

    if (!prevBatchNo && productBmrs.length > 0) {
      prevBatchNo = productBmrs[productBmrs.length - 1].batchNo;
    }

    const nextSeq = String(maxSeq + 1).padStart(4, "0");
    return { nextBatchNo: `${prefix}-${yymm}-${nextSeq}`, prevBatchNo };
  };

  return (
    <BMRContext.Provider value={{ bmrs, addBMR, updateBMR, getBMR, getNextBatchNo }}>
      {children}
    </BMRContext.Provider>
  );
};
