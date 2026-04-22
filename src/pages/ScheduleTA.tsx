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

// FY-scoped data
const DATA: Record<
  string,
  {
    herbs: Herb[];
    metals: Metal[];
    animals: Animal[];
    marines: Marine[];
    finished: Finished[];
  }
> = {
  "FY 2024-25": {
    herbs: [
      {
        name: "Ashwagandha",
        bot: "Withania somnifera",
        qty: "48.2",
        traders: "48.2",
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: "48.2",
        part: "Root",
        batches: [
          { grn: "GRN-2024-0042", date: "12 May 2024", qty: "25.0 kg", supplier: "Herbal Roots Pvt Ltd" },
          { grn: "GRN-2024-0118", date: "08 Sep 2024", qty: "23.2 kg", supplier: "Herbal Roots Pvt Ltd" },
        ],
      },
      {
        name: "Amalaki",
        bot: "Emblica officinalis",
        qty: "120.5",
        traders: "80.0",
        mfg: "—",
        forest: "—",
        cult: "40.5",
        imp: "—",
        total: "120.5",
        part: "Fruit rind",
        batches: [
          { grn: "GRN-2024-0061", date: "20 Jun 2024", qty: "80.0 kg", supplier: "Vana Suppliers" },
          { grn: "GRN-2024-0152", date: "15 Nov 2024", qty: "40.5 kg", supplier: "Own Cultivation Farm" },
        ],
      },
      {
        name: "Haritaki",
        bot: "Terminalia chebula",
        qty: "85.0",
        traders: "85.0",
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: "85.0",
        part: "Fruit rind",
        batches: [
          { grn: "GRN-2024-0073", date: "02 Jul 2024", qty: "50.0 kg", supplier: "Himalaya Botanicals" },
          { grn: "GRN-2025-0014", date: "22 Jan 2025", qty: "35.0 kg", supplier: "Himalaya Botanicals" },
        ],
      },
      {
        name: "Pippali",
        bot: "Piper longum",
        qty: "32.4",
        traders: "32.4",
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: "32.4",
        part: "Fruit",
        batches: [
          { grn: "GRN-2024-0089", date: "18 Aug 2024", qty: "32.4 kg", supplier: "Spice Origins" },
        ],
      },
      {
        name: "Dhataki Pushpa",
        bot: "Woodfordia fruticosa",
        qty: "18.0",
        traders: "—",
        mfg: "—",
        forest: "18.0",
        cult: "—",
        imp: "—",
        total: "18.0",
        part: "Flower",
        batches: [
          { grn: "GRN-2024-0102", date: "10 Sep 2024", qty: "18.0 kg", supplier: "Forest Cooperative MH" },
        ],
      },
    ],
    metals: [
      {
        name: "Abhraka Bhasma",
        chem: "Mica / Biotite silicate",
        qty: "2.4",
        mfg: "2.4",
        traders: "—",
        imp: "—",
        total: "2.4",
        batches: [
          { grn: "GRN-2024-0055", date: "05 Jun 2024", qty: "2.4 kg", supplier: "Bhasma Manufacturers India" },
        ],
      },
      {
        name: "Godanti Bhasma",
        chem: "Calcium sulphate (Selenite)",
        qty: "1.2",
        mfg: "—",
        traders: "1.2",
        imp: "—",
        total: "1.2",
        batches: [
          { grn: "GRN-2024-0091", date: "22 Aug 2024", qty: "1.2 kg", supplier: "Mineral Traders Co" },
        ],
      },
    ],
    animals: [
      {
        name: "Madhu (Honey)",
        source: "Apis cerana indica",
        qty: "12.0",
        total: "12.0",
        batches: [
          { grn: "GRN-2024-0067", date: "28 Jun 2024", qty: "12.0 kg", supplier: "Khadi Honey Co-op" },
        ],
      },
    ],
    marines: [],
    finished: [
      { product: "Triphala Churna", batchNos: "TRCH-2405-0001, TRCH-2410-0002", manufactured: "85.0 kg", sold: "78.5 kg" },
      { product: "Chyawanprash", batchNos: "CHYA-2406-0001, CHYA-2412-0003", manufactured: "120.0 kg", sold: "112.0 kg" },
      { product: "Ashwagandha Churna", batchNos: "ASCH-2407-0001", manufactured: "40.0 kg", sold: "35.5 kg" },
    ],
  },
  "FY 2023-24": {
    herbs: [
      {
        name: "Ashwagandha",
        bot: "Withania somnifera",
        qty: "42.0",
        traders: "42.0",
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: "42.0",
        part: "Root",
        batches: [
          { grn: "GRN-2023-0038", date: "10 May 2023", qty: "42.0 kg", supplier: "Herbal Roots Pvt Ltd" },
        ],
      },
      {
        name: "Amalaki",
        bot: "Emblica officinalis",
        qty: "95.0",
        traders: "95.0",
        mfg: "—",
        forest: "—",
        cult: "—",
        imp: "—",
        total: "95.0",
        part: "Fruit rind",
        batches: [
          { grn: "GRN-2023-0070", date: "18 Jul 2023", qty: "95.0 kg", supplier: "Vana Suppliers" },
        ],
      },
    ],
    metals: [
      {
        name: "Abhraka Bhasma",
        chem: "Mica / Biotite silicate",
        qty: "1.8",
        mfg: "1.8",
        traders: "—",
        imp: "—",
        total: "1.8",
        batches: [
          { grn: "GRN-2023-0049", date: "01 Jun 2023", qty: "1.8 kg", supplier: "Bhasma Manufacturers India" },
        ],
      },
    ],
    animals: [],
    marines: [],
    finished: [
      { product: "Triphala Churna", batchNos: "TRCH-2305-0001", manufactured: "60.0 kg", sold: "60.0 kg" },
    ],
  },
  "FY 2022-23": {
    herbs: [],
    metals: [],
    animals: [],
    marines: [],
    finished: [],
  },
};

const FY_OPTIONS = ["FY 2024-25", "FY 2023-24", "FY 2022-23"];

const ScheduleTA = () => {
  const navigate = useNavigate();
  const [fy, setFy] = useState("FY 2024-25");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    b: true,
    d: true,
    e: true,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [missing, setMissing] = useState<string[] | null>(null);

  const data = DATA[fy];

  const fyDateRange = useMemo(() => {
    const m = fy.match(/FY (\d{4})-(\d{2})/);
    if (!m) return "";
    const start = m[1];
    const end = `20${m[2]}`;
    return `01 Apr ${start} to 31 Mar ${end}`;
  }, [fy]);

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
        {/* Validation banner */}
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

        {/* Facility info */}
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
                    <th>Qty sold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.finished.map((r) => (
                    <tr key={r.product}>
                      <td className="font-medium">{r.product}</td>
                      <td className="text-[11px]">{r.batchNos}</td>
                      <td>{r.manufactured}</td>
                      <td>{r.sold}</td>
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
          {batches.map((b) => (
            <div key={b.grn} className="px-3 py-2 text-[11px] space-y-0.5">
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
  data: (typeof DATA)[string];
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
              <th>Qty sold</th>
            </tr>
          </thead>
          <tbody>
            {data.finished.map((f) => (
              <tr key={f.product}>
                <td>{f.product}</td>
                <td>{f.batchNos}</td>
                <td>{f.manufactured}</td>
                <td>{f.sold}</td>
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
