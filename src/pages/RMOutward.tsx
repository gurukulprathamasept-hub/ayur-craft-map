import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBMRs } from "@/context/BMRContext";
import { ArrowLeft, Package, FlaskConical, Search, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

/* ── Single-drug issue detail ── */
const SingleDrugIssueDetail = ({ onBack }: { onBack: () => void }) => {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <button onClick={onBack} className="p-1 rounded hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <div className="text-[15px] font-medium">Single RM issue</div>
          <div className="text-[11px] text-muted-foreground mt-px">ISS-2025-0095 · Ad-hoc dispensing</div>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Confirm issue</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="form-field"><label>Issue slip no.</label><input value="ISS-2025-0095" disabled className="bg-secondary" /></div>
          <div className="form-field"><label>Issue date</label><input type="date" defaultValue="2025-06-14" /></div>
          <div className="form-field"><label>Purpose / Dept</label><input placeholder="e.g. QC Lab, R&D, Maintenance" /></div>
          <div className="form-field"><label>Requested by</label><input placeholder="Person requesting" /></div>
          <div className="form-field"><label>Approved by</label><input placeholder="Authorising officer" /></div>
          <div className="form-field"><label>Issued by</label><input placeholder="Store person" /></div>
        </div>

        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Select raw material to issue</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>Raw material</div><div>Available stock</div><div>FIFO batch</div><div>Expiry</div><div>Qty to issue</div>
            </div>
            {[
              { name: "Ashwagandha", bot: "Withania somnifera", stock: "45.2 kg", batch: "AR/2025-089", expiry: "Mar 2026" },
              { name: "Shatavari", bot: "Asparagus racemosus", stock: "22.8 kg", batch: "AR/2025-102", expiry: "Jan 2026" },
              { name: "Guduchi", bot: "Tinospora cordifolia", stock: "18.5 kg", batch: "AR/2025-055", expiry: "Nov 2025" },
            ].map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 py-2.5 items-center text-xs ${i < 2 ? "border-b border-border" : ""}`}>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.bot}</div>
                </div>
                <div>{item.stock}</div>
                <div><span className="app-badge app-badge-teal">{item.batch}</span></div>
                <div>{item.expiry}</div>
                <div><input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]" placeholder="0.000" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <div className="form-field"><label>Remarks</label><textarea className="min-h-[60px]" placeholder="Reason for ad-hoc issue..." /></div>
        </div>
      </div>
    </>
  );
};

/* ── Batch issue detail (original screen) ── */
const BatchIssueDetail = ({ onBack, bmrLabel }: { onBack: () => void; bmrLabel: string }) => {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <button onClick={onBack} className="p-1 rounded hover:bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM issue to production</div>
          <div className="text-[11px] text-muted-foreground mt-px">ISS-2025-0094 · Against {bmrLabel}</div>
        </div>
        <button onClick={onBack} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Back</button>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">Confirm issue</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-3 mb-2.5">
          <div className="form-field"><label>Issue slip no.</label><input value="ISS-2025-0094" disabled className="bg-secondary" /></div>
          <div className="form-field"><label>BMR reference</label><input value={bmrLabel} disabled className="bg-secondary" /></div>
          <div className="form-field"><label>Issue date</label><input type="date" defaultValue="2025-06-14" /></div>
          <div className="form-field"><label>Requested by</label><input defaultValue="Suresh Patil (Production)" /></div>
          <div className="form-field"><label>Approved by</label><input defaultValue="Dr. A. Kulkarni (Tech. Staff)" /></div>
          <div className="form-field"><label>Issued by</label><input defaultValue="Ramesh Nair (Store)" /></div>
        </div>

        <div className="app-card">
          <div className="app-card-head"><div className="app-card-title">Ingredients to issue — FIFO batch auto-selected</div></div>
          <div className="p-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b border-border">
              <div>RM</div><div>Required (BMR)</div><div>FIFO batch</div><div>Expiry</div><div>Qty to issue</div><div>Variance</div>
            </div>
            {[
              { name: "Amla / Amalaki", bot: "Emblica officinalis", req: "3.333 kg", batch: "AR/2025-162", batchColor: "teal", expiry: "Dec 2025", qty: 3.333, variance: "0.000", vClass: "text-kpi-ok" },
              { name: "Haritaki", bot: "Terminalia chebula", req: "3.333 kg", batch: "AR/2024-312", batchColor: "amber", expiry: "14 Jun 2025", expiryWarn: true, qty: 3.333, variance: "0.000", vClass: "text-kpi-ok" },
              { name: "Vibhitaki", bot: "Terminalia bellirica", req: "3.334 kg", batch: "AR/2025-171", batchColor: "teal", expiry: "Feb 2026", qty: 3.334, variance: "0.000", vClass: "text-kpi-ok" },
            ].map((item, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr_1fr] gap-2 py-2 items-center text-xs ${i < 2 ? "border-b border-border" : ""}`}>
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground">{item.bot}</div>
                </div>
                <div>{item.req}</div>
                <div><span className={`app-badge app-badge-${item.batchColor}`}>{item.batch}</span></div>
                <div className={item.expiryWarn ? "text-kpi-warning font-medium" : ""}>{item.expiry}</div>
                <div><input type="number" className="w-[70px] px-2 py-1 border border-border rounded-md text-[11px]" defaultValue={item.qty} /></div>
                <div className={`${item.vClass} font-medium`}>{item.variance}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="alert-strip alert-strip-amber mt-1.5">
          Warning: Haritaki batch AR/2024-312 expires today. Confirm use with QC before issuing.
        </div>
      </div>
    </>
  );
};

/* ── Main RMOutward page ── */
const RMOutward = () => {
  const navigate = useNavigate();
  const { bmrs } = useBMRs();
  const [view, setView] = useState<"list" | "batch" | "single">("list");
  const [selectedBMR, setSelectedBMR] = useState<string>("");
  const [search, setSearch] = useState("");

  if (view === "batch") return <BatchIssueDetail onBack={() => setView("list")} bmrLabel={selectedBMR} />;
  if (view === "single") return <SingleDrugIssueDetail onBack={() => setView("list")} />;

  /* Demo batch issues */
  const demoBatchIssues = [
    { id: "ISS-2025-0094", bmr: "BMR-2025-0041", product: "Triphala Churna", batchSize: "10 kg", date: "14 Jun 2025", status: "Pending", items: 3 },
    { id: "ISS-2025-0091", bmr: "BMR-2025-0039", product: "Chyawanprash", batchSize: "50 kg", date: "12 Jun 2025", status: "Issued", items: 8 },
    { id: "ISS-2025-0088", bmr: "BMR-2025-0037", product: "Ashwagandharishta", batchSize: "100 L", date: "10 Jun 2025", status: "Issued", items: 5 },
  ];

  const demoSingleIssues = [
    { id: "ISS-2025-0093", rm: "Ashwagandha root powder", qty: "2.5 kg", purpose: "QC Lab testing", date: "13 Jun 2025", status: "Issued" },
    { id: "ISS-2025-0090", rm: "Ghee (Cow)", qty: "5 kg", purpose: "R&D trial batch", date: "11 Jun 2025", status: "Issued" },
  ];

  /* Add context BMRs as pending batch issues */
  const contextBatchIssues = bmrs.filter(b => b.status === "In process" || b.status === "Draft").map(b => ({
    id: `ISS-${b.batchNo.replace("BATCH-", "")}`,
    bmr: b.batchNo,
    product: b.productName,
    batchSize: `${b.batchSize} ${b.batchUnit}`,
    date: b.startDate,
    status: "Pending",
    items: b.ingredients.length,
  }));

  const allBatch = [...contextBatchIssues, ...demoBatchIssues];
  const filteredBatch = allBatch.filter(i => i.product.toLowerCase().includes(search.toLowerCase()) || i.bmr.toLowerCase().includes(search.toLowerCase()));
  const filteredSingle = demoSingleIssues.filter(i => i.rm.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM Outward / Issue</div>
          <div className="text-[11px] text-muted-foreground mt-px">Issue raw materials — batch (BMR) or single drug</div>
        </div>
        <button onClick={() => { setSelectedBMR(""); setView("single"); }} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5" /> New single issue
        </button>
        <button onClick={() => navigate("/bmr")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> New batch issue
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product, BMR no., or RM name..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-xs bg-background"
          />
        </div>

        <Tabs defaultValue="batch" className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="batch" className="text-xs">Batch issue (BMR)</TabsTrigger>
            <TabsTrigger value="single" className="text-xs">Single drug issue</TabsTrigger>
          </TabsList>

          {/* ── Batch issues tab ── */}
          <TabsContent value="batch">
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">Batch issues against BMR</div></div>
              <div className="divide-y divide-border">
                {filteredBatch.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No batch issues found. Create a BMR first to issue materials against it.</div>
                )}
                {filteredBatch.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelectedBMR(`${item.bmr} · ${item.product}`); setView("batch"); }}
                    className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.6fr_0.5fr] gap-2 px-3.5 py-2.5 items-center text-xs hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-primary">{item.id}</div>
                    <div>
                      <div className="font-medium">{item.product}</div>
                      <div className="text-[10px] text-muted-foreground">{item.bmr}</div>
                    </div>
                    <div>{item.batchSize}</div>
                    <div>{item.date}</div>
                    <div>{item.items} items</div>
                    <div>
                      <span className={`app-badge ${item.status === "Issued" ? "app-badge-teal" : "app-badge-amber"}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Single drug issues tab ── */}
          <TabsContent value="single">
            <div className="app-card">
              <div className="app-card-head"><div className="app-card-title">Single drug / ad-hoc issues</div></div>
              <div className="divide-y divide-border">
                {filteredSingle.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">No single drug issues found.</div>
                )}
                {filteredSingle.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setView("single")}
                    className="grid grid-cols-[1fr_1.5fr_0.8fr_1fr_0.8fr_0.5fr] gap-2 px-3.5 py-2.5 items-center text-xs hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="font-medium text-primary">{item.id}</div>
                    <div className="font-medium">{item.rm}</div>
                    <div>{item.qty}</div>
                    <div className="text-muted-foreground">{item.purpose}</div>
                    <div>{item.date}</div>
                    <div>
                      <span className="app-badge app-badge-teal">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default RMOutward;
