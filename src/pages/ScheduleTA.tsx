import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, AlertTriangle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { useStock } from "@/context/StockContext";
import { useBMRs } from "@/context/BMRContext";

type Batch = { grn: string; date: string; qty: string; supplier: string };
type Herb = {
  name: string;
  bot: string;
  qty: string;
  traders: string;
  mfg: string;
  forest: string;
  cult: string;
  imp: string;
  total: string;
  part: string;
  batches: Batch[];
};
type Metal = {
  name: string;
  chem: string;
  qty: string;
  mfg: string;
  traders: string;
  imp: string;
  total: string;
  batches: Batch[];
};
type Animal = {
  name: string;
  source: string;
  qty: string;
  total: string;
  batches: Batch[];
};
type Marine = {
  name: string;
  source: string;
  qty: string;
  total: string;
  batches: Batch[];
};
type Finished = {
  product: string;
  batchNos: string;
  manufactured: string;
  sold: string;
};

type DerivedData = {
  herbs: Herb[];
  metals: Metal[];
  animals: Animal[];
  marines: Marine[];
  finished: Finished[];
};

const FY_OPTIONS = ["FY 2024-25", "FY 2023-24", "FY 2022-23"];

// FY string -> [start, end) JS Date range
function fyRangeDates(fy: string): { start: Date; end: Date } | null {
  const m = fy.match(/FY (\d{4})-(\d{2})/);
  if (!m) return null;
  const startYear = parseInt(m[1], 10);
  const endYear = parseInt(`20${m[2]}`, 10);
  return {
    start: new Date(startYear, 3, 1), // 1 Apr
    end: new Date(endYear, 3, 1),     // 1 Apr next year (exclusive)
  };
}

// Parse dates like "01 Apr 2025", "2025-04-01", "Apr 2025"
function parseAnyDate(s: string | undefined | null): Date | null {
  if (!s || s === "—") return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function inFY(dateStr: string | undefined, range: { start: Date; end: Date } | null) {
  if (!range) return false;
  const d = parseAnyDate(dateStr);
  if (!d) return false;
  return d >= range.start && d < range.end;
}

const ScheduleTA = () => {
  const navigate = useNavigate();
  const { rmData, pendingGRNs } = useStock();
  const { bmrs } = useBMRs();
  const [fy, setFy] = useState("FY 2024-25");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    b: true,
    d: true,
    e: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [missing, setMissing] = useState<string[] | null>(null);

  const fyDateRange = useMemo(() => {
    const m = fy.match(/FY (\d{4})-(\d{2})/);
    if (!m) return "";
    return `01 Apr ${m[1]} to 31 Mar 20${m[2]}`;
  }, [fy]);

  const data = useMemo<DerivedData>(() => {
    const range = fyRangeDates(fy);

    // Build supplier lookup per rmName from pendingGRNs
    const suppliersByRm = new Map<string, Set<string>>();
    const grnBatchesByRm = new Map<string, Batch[]>();
    pendingGRNs.forEach((grn) => {
      if (!inFY(grn.date, range)) return;
      grn.lines.forEach((ln) => {
        if (!suppliersByRm.has(ln.rmName)) suppliersByRm.set(ln.rmName, new Set());
        suppliersByRm.get(ln.rmName)!.add(grn.supplier);
        if (!grnBatchesByRm.has(ln.rmName)) grnBatchesByRm.set(ln.rmName, []);
        grnBatchesByRm.get(ln.rmName)!.push({
          grn: grn.grnNo,
          date: grn.date,
          qty: `${ln.qty} ${ln.uom}`,
          supplier: grn.supplier,
        });
      });
    });

    const parseQty = (s: string) => {
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const fmt = (n: number) => (n > 0 ? n.toFixed(2) : "—");

    const buildHerbRow = (rm: typeof rmData[number]): Herb => {
      let inwardQty = 0;
      let outwardQty = 0;
      const batches: Batch[] = [];
      rm.txns.forEach((t) => {
        if (!inFY(t.date, range)) return;
        if (t.type === "Inward") {
          const q = parseQty(t.qtyIn);
          inwardQty += q;
          batches.push({
            grn: t.ref,
            date: t.date,
            qty: `${q.toFixed(3)} ${rm.uom}`,
            supplier: "—",
          });
        } else if (t.type === "Outward") {
          outwardQty += parseQty(t.qtyOut);
        }
      });

      // Prefer GRN-derived batches w/ supplier when available
      const grnBatches = grnBatchesByRm.get(rm.name) ?? [];
      const mergedBatches = grnBatches.length ? grnBatches : batches;

      const traders = fmt(inwardQty);
      return {
        name: rm.name,
        bot: rm.botanical,
        qty: outwardQty > 0 ? outwardQty.toFixed(2) : "—",
        traders,
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: traders,
        part: rm.part,
        batches: mergedBatches,
      };
    };

    const buildMetalRow = (rm: typeof rmData[number]): Metal => {
      let inwardQty = 0;
      let outwardQty = 0;
      const batches: Batch[] = [];
      rm.txns.forEach((t) => {
        if (!inFY(t.date, range)) return;
        if (t.type === "Inward") {
          const q = parseQty(t.qtyIn);
          inwardQty += q;
          batches.push({
            grn: t.ref,
            date: t.date,
            qty: `${q.toFixed(3)} ${rm.uom}`,
            supplier: "—",
          });
        } else if (t.type === "Outward") {
          outwardQty += parseQty(t.qtyOut);
        }
      });
      const grnBatches = grnBatchesByRm.get(rm.name) ?? [];
      const mergedBatches = grnBatches.length ? grnBatches : batches;

      const traders = fmt(inwardQty);
      return {
        name: rm.name,
        chem: rm.botanical,
        qty: outwardQty > 0 ? outwardQty.toFixed(2) : "—",
        mfg: "—",
        traders,
        imp: "—",
        total: traders,
        batches: mergedBatches,
      };
    };

    const buildAnimalRow = (rm: typeof rmData[number]): Animal => {
      let inwardQty = 0;
      let outwardQty = 0;
      const batches: Batch[] = [];
      rm.txns.forEach((t) => {
        if (!inFY(t.date, range)) return;
        if (t.type === "Inward") {
          const q = parseQty(t.qtyIn);
          inwardQty += q;
          batches.push({
            grn: t.ref,
            date: t.date,
            qty: `${q.toFixed(3)} ${rm.uom}`,
            supplier: "—",
          });
        } else if (t.type === "Outward") {
          outwardQty += parseQty(t.qtyOut);
        }
      });
      const grnBatches = grnBatchesByRm.get(rm.name) ?? [];
      const mergedBatches = grnBatches.length ? grnBatches : batches;
      return {
        name: rm.name,
        source: rm.botanical,
        qty: outwardQty > 0 ? outwardQty.toFixed(2) : "—",
        total: inwardQty > 0 ? inwardQty.toFixed(2) : "—",
        batches: mergedBatches,
      };
    };

    const isHerb = (c: string) => /herb/i.test(c);
    const isMetal = (c: string) => /metal|mineral/i.test(c);
    const isAnimal = (c: string) => /animal/i.test(c);
    const isMarine = (c: string) => /marine/i.test(c);

    const herbs = rmData
      .filter((r) => isHerb(r.category))
      .map(buildHerbRow)
      .filter((r) => r.qty !== "—" || r.total !== "—" || r.batches.length);

    const metals = rmData
      .filter((r) => isMetal(r.category))
      .map(buildMetalRow)
      .filter((r) => r.qty !== "—" || r.total !== "—" || r.batches.length);

    const animals = rmData
      .filter((r) => isAnimal(r.category))
      .map(buildAnimalRow)
      .filter((r) => r.qty !== "—" || r.total !== "—" || r.batches.length);

    const marines = rmData
      .filter((r) => isMarine(r.category))
      .map(buildAnimalRow)
      .filter((r) => r.qty !== "—" || r.total !== "—" || r.batches.length);

    // Finished products from bmrs within FY
    const finishedMap = new Map<string, { batchNos: string[]; qty: number; unit: string }>();
    bmrs.forEach((b) => {
      const dateStr = b.completionDate || b.startDate;
      if (!inFY(dateStr, range)) return;
      const key = b.productName || "—";
      if (!finishedMap.has(key)) finishedMap.set(key, { batchNos: [], qty: 0, unit: b.batchUnit || "kg" });
      const e = finishedMap.get(key)!;
      if (b.batchNo) e.batchNos.push(b.batchNo);
      e.qty += Number(b.batchSize) || 0;
    });

    const finished: Finished[] = Array.from(finishedMap.entries()).map(([product, v]) => ({
      product,
      batchNos: v.batchNos.join(", ") || "—",
      manufactured: `${v.qty.toFixed(2)} ${v.unit}`,
      sold: "—",
    }));

    return { herbs, metals, animals, marines, finished };
  }, [fy, rmData, pendingGRNs, bmrs]);

  const validate = (): string[] => {
    const issues: string[] = [];
    if (!data.herbs.length) issues.push("Section (a) Herbs — no entries");
    if (!data.metals.length) issues.push("Section (c) Metals/Minerals — no entries");
    if (!data.finished.length) issues.push("Section (e) Finished Products — no entries");
    return issues;
  };

  const handleSubmit = () => {
    const issues = validate();
    if (issues.length) {
      setMissing(issues);
      return;
    }
    toast({ title: "Schedule TA submitted", description: `${fy} return queued for filing.` });
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const toggle = (k: string) => setExpanded((s) => ({ ...s, [k]: !s[k] }));

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Schedule TA — Annual return</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            Rule 157A · {fy} · Auto-compiled from GRN data
          </div>
        </div>
        <Select value={fy} onValueChange={setFy}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FY_OPTIONS.map((f) => (
              <SelectItem key={f} value={f} className="text-xs">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          onClick={() => navigate("/")}
          className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all"
        >
          Back
        </button>
        <button
          onClick={handlePreview}
          className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all"
        >
          Preview PDF
        </button>
        <button
          onClick={handleSubmit}
          className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
        >
          Submit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {missing && (
          <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-semibold text-destructive">
                Cannot submit — {missing.length} issue{missing.length > 1 ? "s" : ""} found
              </div>
              <ul className="text-[11px] text-destructive/90 mt-1 list-disc pl-4 space-y-0.5">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setMissing(null)}
              className="text-destructive hover:opacity-70"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="bg-secondary rounded-md p-3.5 mb-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Mfg. license no.</div>
            <div className="font-medium">MH-AY-2018-042</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Issued by</div>
            <div className="font-medium">FDA Maharashtra</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Facility</div>
            <div className="font-medium">Vaidya Pharma Pvt. Ltd., Pune</div>
          </div>
        </div>

        {/* (a) Herbs */}
        <Section
          title={`(a) Herbs used — ${fyDateRange}`}
          empty={data.herbs.length === 0}
          badgeText="Auto-compiled"
        >
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Common name (AFI/API)</th>
                  <th>Botanical name</th>
                  <th>Qty used (kg/annum)</th>
                  <th>Traders</th>
                  <th>Manufacturers</th>
                  <th>Forest collectors</th>
                  <th>Cultivators</th>
                  <th>Imported</th>
                  <th>Total</th>
                  <th>Part used</th>
                  <th>Batches</th>
                </tr>
              </thead>
              <tbody>
                {data.herbs.map((r) => (
                  <tr key={r.name}>
                    <td className="font-medium">{r.name}</td>
                    <td className="italic text-[11px] text-muted-foreground">{r.bot}</td>
                    <td>{r.qty}</td>
                    <td>{r.traders}</td>
                    <td>{r.mfg}</td>
                    <td>{r.forest}</td>
                    <td>{r.cult}</td>
                    <td>{r.imp}</td>
                    <td>{r.total}</td>
                    <td>{r.part}</td>
                    <td>
                      <BatchTooltip batches={r.batches} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* (b) Animal products */}
        <CollapsibleSection
          title="(b) Animal products used"
          open={expanded.b}
          onToggle={() => toggle("b")}
          empty={data.animals.length === 0}
        >
          {data.animals.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Common name</th>
                    <th>Source / Species</th>
                    <th>Qty used (kg/annum)</th>
                    <th>Total</th>
                    <th>Batches</th>
                  </tr>
                </thead>
                <tbody>
                  {data.animals.map((r) => (
                    <tr key={r.name}>
                      <td className="font-medium">{r.name}</td>
                      <td className="italic text-[11px] text-muted-foreground">{r.source}</td>
                      <td>{r.qty}</td>
                      <td>{r.total}</td>
                      <td>
                        <BatchTooltip batches={r.batches} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleSection>

        {/* (c) Metals */}
        <Section
          title="(c) Metals / minerals used"
          empty={data.metals.length === 0}
          badgeText="Auto-compiled"
        >
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Common name</th>
                  <th>Chemical name</th>
                  <th>Qty used (kg/annum)</th>
                  <th>Manufacturers</th>
                  <th>Traders (domestic)</th>
                  <th>Importers</th>
                  <th>Total</th>
                  <th>Batches</th>
                </tr>
              </thead>
              <tbody>
                {data.metals.map((r) => (
                  <tr key={r.name}>
                    <td className="font-medium">{r.name}</td>
                    <td className="text-[11px]">{r.chem}</td>
                    <td>{r.qty}</td>
                    <td>{r.mfg}</td>
                    <td>{r.traders}</td>
                    <td>{r.imp}</td>
                    <td>{r.total}</td>
                    <td>
                      <BatchTooltip batches={r.batches} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* (d) Marine products */}
        <CollapsibleSection
          title="(d) Marine products used"
          open={expanded.d}
          onToggle={() => toggle("d")}
          empty={data.marines.length === 0}
        >
          {data.marines.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Common name</th>
                    <th>Source / Species</th>
                    <th>Qty used (kg/annum)</th>
                    <th>Total</th>
                    <th>Batches</th>
                  </tr>
                </thead>
                <tbody>
                  {data.marines.map((r) => (
                    <tr key={r.name}>
                      <td className="font-medium">{r.name}</td>
                      <td className="italic text-[11px] text-muted-foreground">{r.source}</td>
                      <td>{r.qty}</td>
                      <td>{r.total}</td>
                      <td>
                        <BatchTooltip batches={r.batches} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleSection>

        {/* (e) Finished products */}
        <CollapsibleSection
          title="(e) Finished products manufactured"
          open={expanded.e}
          onToggle={() => toggle("e")}
          empty={data.finished.length === 0}
        >
          {data.finished.length > 0 && (
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Product name</th>
                    <th>Batch nos.</th>
                    <th>Qty manufactured</th>
                  </tr>
                </thead>
                <tbody>
                  {data.finished.map((r) => (
                    <tr key={r.product}>
                      <td className="font-medium">{r.product}</td>
                      <td className="text-[11px]">{r.batchNos}</td>
                      <td>{r.manufactured}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Preview PDF dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-5 pb-3 border-b sticky top-0 bg-background z-10 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm">Schedule TA — PDF Preview</DialogTitle>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 mr-6"
            >
              Print
            </button>
          </DialogHeader>
          <PrintableForm fy={fy} fyDateRange={fyDateRange} data={data} />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

const Section = ({
  title,
  empty,
  badgeText,
  children,
}: {
  title: string;
  empty: boolean;
  badgeText: string;
  children: React.ReactNode;
}) => (
  <div className="app-card mb-2.5">
    <div className="app-card-head">
      <div className="app-card-title">{title}</div>
      <span className="app-badge app-badge-teal">{badgeText}</span>
    </div>
    {empty ? (
      <div className="px-3.5 py-4 text-[11px] text-muted-foreground italic">No entries for this period.</div>
    ) : (
      children
    )}
  </div>
);

const CollapsibleSection = ({
  title,
  open,
  onToggle,
  empty,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  empty: boolean;
  children: React.ReactNode;
}) => (
  <div className="app-card mb-2.5">
    <button
      onClick={onToggle}
      className="app-card-head w-full text-left hover:bg-secondary/40 transition-colors"
    >
      <div className="flex items-center gap-1.5 flex-1">
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <div className="app-card-title">{title}</div>
      </div>
      {empty ? (
        <span className="app-badge app-badge-gray">No entries</span>
      ) : (
        <span className="app-badge app-badge-teal">Auto-compiled</span>
      )}
    </button>
    {open && (
      <>
        {empty ? (
          <div className="px-3.5 py-3 text-[11px] text-muted-foreground italic">
            No entries for this period.
          </div>
        ) : (
          children
        )}
      </>
    )}
  </div>
);

const BatchTooltip = ({ batches }: { batches: Batch[] }) => {
  if (!batches.length) return <span className="text-muted-foreground text-[11px]">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="text-[11px] text-primary underline-offset-2 hover:underline font-medium">
          {batches.length} batch{batches.length > 1 ? "es" : ""}
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-sm p-0 overflow-hidden">
        <div className="bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide border-b">
          Contributing batches
        </div>
        <div className="divide-y">
          {batches.map((b, i) => (
            <div key={`${b.grn}-${i}`} className="px-3 py-2 text-[11px] space-y-0.5">
              <div className="flex justify-between gap-3">
                <span className="font-medium">{b.grn}</span>
                <span className="text-muted-foreground">{b.date}</span>
              </div>
              <div className="flex justify-between gap-3 text-muted-foreground">
                <span>{b.supplier}</span>
                <span className="font-medium text-foreground">{b.qty}</span>
              </div>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const PrintableForm = ({
  fy,
  fyDateRange,
  data,
}: {
  fy: string;
  fyDateRange: string;
  data: DerivedData;
}) => (
  <div className="px-10 py-8 bg-white text-black text-[11px] leading-relaxed print:px-6 print:py-4">
    <style>{`
      @media print {
        @page { size: A4; margin: 14mm; }
        body * { visibility: hidden; }
        .printable, .printable * { visibility: visible; }
        .printable { position: absolute; left: 0; top: 0; width: 100%; }
      }
      .pf-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
      .pf-table th, .pf-table td { border: 1px solid #333; padding: 4px 6px; text-align: left; font-size: 10px; }
      .pf-table th { background: #f3f3f3; font-weight: 600; }
    `}</style>
    <div className="printable">
      <div className="text-center mb-4">
        <div className="text-[13px] font-bold uppercase">Schedule TA</div>
        <div className="text-[10px]">[See Rule 157A of the Drugs and Cosmetics Rules, 1945]</div>
        <div className="text-[11px] font-semibold mt-1">
          Annual Return of Ayurvedic / Siddha / Unani Drugs Manufactured
        </div>
        <div className="text-[10px] mt-0.5">Period: {fyDateRange} ({fy})</div>
      </div>

      <table className="pf-table mb-3">
        <tbody>
          <tr>
            <th style={{ width: "30%" }}>Name &amp; Address of Manufacturer</th>
            <td>Vaidya Pharma Pvt. Ltd., Pune, Maharashtra</td>
          </tr>
          <tr>
            <th>Manufacturing Licence No.</th>
            <td>MH-AY-2018-042</td>
          </tr>
          <tr>
            <th>Issuing Authority</th>
            <td>FDA Maharashtra</td>
          </tr>
          <tr>
            <th>Period of Return</th>
            <td>{fyDateRange}</td>
          </tr>
        </tbody>
      </table>

      <div className="font-semibold mt-3 mb-1">(a) Herbs used during the period</div>
      {data.herbs.length ? (
        <table className="pf-table">
          <thead>
            <tr>
              <th>Common name</th>
              <th>Botanical name</th>
              <th>Part</th>
              <th>Total qty (kg)</th>
              <th>Source breakdown</th>
            </tr>
          </thead>
          <tbody>
            {data.herbs.map((h) => (
              <tr key={h.name}>
                <td>{h.name}</td>
                <td><i>{h.bot}</i></td>
                <td>{h.part}</td>
                <td>{h.total}</td>
                <td>
                  T:{h.traders} M:{h.mfg} F:{h.forest} C:{h.cult} I:{h.imp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="italic text-gray-500">No entries.</div>
      )}

      <div className="font-semibold mt-3 mb-1">(b) Animal products used</div>
      {data.animals.length ? (
        <table className="pf-table">
          <thead>
            <tr>
              <th>Common name</th>
              <th>Source</th>
              <th>Qty (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.animals.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td><i>{a.source}</i></td>
                <td>{a.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="italic text-gray-500">No entries.</div>
      )}

      <div className="font-semibold mt-3 mb-1">(c) Metals / minerals used</div>
      {data.metals.length ? (
        <table className="pf-table">
          <thead>
            <tr>
              <th>Common name</th>
              <th>Chemical name</th>
              <th>Total qty (kg)</th>
              <th>Source breakdown</th>
            </tr>
          </thead>
          <tbody>
            {data.metals.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{m.chem}</td>
                <td>{m.total}</td>
                <td>M:{m.mfg} T:{m.traders} I:{m.imp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="italic text-gray-500">No entries.</div>
      )}

      <div className="font-semibold mt-3 mb-1">(d) Marine products used</div>
      {data.marines.length ? (
        <table className="pf-table">
          <thead>
            <tr>
              <th>Common name</th>
              <th>Source</th>
              <th>Qty (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.marines.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td><i>{m.source}</i></td>
                <td>{m.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="italic text-gray-500">No entries.</div>
      )}

      <div className="font-semibold mt-3 mb-1">(e) Finished products manufactured</div>
      {data.finished.length ? (
        <table className="pf-table">
          <thead>
            <tr>
              <th>Product name</th>
              <th>Batch numbers</th>
              <th>Qty manufactured</th>
            </tr>
          </thead>
          <tbody>
            {data.finished.map((f) => (
              <tr key={f.product}>
                <td>{f.product}</td>
                <td>{f.batchNos}</td>
                <td>{f.manufactured}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="italic text-gray-500">No entries.</div>
      )}

      <div className="mt-6 border-t pt-4">
        <div className="font-semibold mb-2">Declaration</div>
        <div className="mb-6">
          I hereby declare that the above information is true and correct to the best of my knowledge
          and belief.
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[11px]">
          <div>
            <div className="border-b border-black h-5"></div>
            <div className="text-[10px] mt-1">Name</div>
          </div>
          <div>
            <div className="border-b border-black h-5"></div>
            <div className="text-[10px] mt-1">Designation</div>
          </div>
          <div>
            <div className="border-b border-black h-5"></div>
            <div className="text-[10px] mt-1">Signature</div>
          </div>
          <div>
            <div className="border-b border-black h-5"></div>
            <div className="text-[10px] mt-1">Date</div>
          </div>
          <div className="col-span-2">
            <div className="border-b border-black h-5"></div>
            <div className="text-[10px] mt-1">Manufacturing Licence No.</div>
          </div>
        </div>
        <div className="text-center text-[9px] text-gray-500 mt-6">
          Place: Pune, Maharashtra · Generated from Vaidya Pharma ERP
        </div>
      </div>
    </div>
  </div>
);

export default ScheduleTA;
