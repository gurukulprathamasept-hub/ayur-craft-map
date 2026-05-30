import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search, Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { useFormulations, type Formulation, type RMItem, type RMCategory } from "@/context/FormulationContext";
import { useLanguage } from "@/context/LanguageContext";
import { CAT_BADGE, CAT_LABELS, TYPE_BADGE, DOSAGE_FORMS, LEGEND_ITEMS } from "@/lib/formulationConstants";

const formatQty = (r: RMItem) => {
  if (r.qty && r.qty > 0) return `${r.qty} ${r.unit}`.trim();
  return r.unit || "";
};

const formatQC = (q: { parameter: string; spec: string }) =>
  `${q.parameter}${q.spec ? ` ${q.spec}` : ""}`.trim();

const FormulationDetail = ({ f }: { f: Formulation }) => {
  const rmByGroup: Record<string, RMItem[]> = {};
  f.rm.forEach((r) => {
    if (!rmByGroup[r.cat]) rmByGroup[r.cat] = [];
    rmByGroup[r.cat].push(r);
  });

  return (
    <div className="px-5 py-4 bg-secondary border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Raw materials */}
        <div>
          <div className="section-divider">Raw materials ({f.rm.length} ingredients)</div>
          {Object.entries(rmByGroup).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {CAT_LABELS[cat] || cat}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((r, i) => (
                  <span key={i} className={`app-badge ${CAT_BADGE[r.cat as RMCategory] || "app-badge-gray"}`}>
                    {r.name.split("(")[0].trim()}
                    <span className="opacity-60 ml-1">{formatQty(r)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Manufacturing steps */}
        <div>
          <div className="section-divider">Manufacturing steps</div>
          <ol className="space-y-1.5">
            {f.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="step-num step-num-current shrink-0 text-[9px] w-4 h-4">{i + 1}</span>
                <span className="text-foreground leading-relaxed">{s.step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* QC Parameters */}
      <div className="section-divider">QC / pharmacopoeial parameters</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {f.qc.map((q, i) => (
          <span key={i} className="app-badge app-badge-gray">{formatQC(q)}</span>
        ))}
      </div>

      {/* IPC + Dosha */}
      <div className="flex flex-wrap gap-6">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">IPC checks</span>
          <div className="text-xs mt-1">{f.ipc}</div>
        </div>
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dosha action</span>
          <div className="text-xs mt-1">{f.dosha}</div>
        </div>
      </div>
    </div>
  );
};

const MFRTable = () => {
  const navigate = useNavigate();
  const { formulations, deleteFormulation } = useFormulations();
  const { displayName } = useLanguage();
  const [filter, setFilter] = useState("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const filtered = formulations.filter((f) => {
    const matchType = filter === "All" || f.type === filter;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.sanskrit.includes(search);
    return matchType && matchSearch;
  });

  const customCount = formulations.filter((f) => !f.isReference).length;

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Manufacturing Reference Table</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {formulations.length} formulations ({customCount} custom) · Ingredients · Manufacturing steps · QC parameters
          </div>
        </div>
        <button onClick={() => navigate("/bmr-create")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <FileText className="w-3 h-3" /> Create BMR
        </button>
        <button onClick={() => navigate("/mfr-create")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1">
          <Plus className="w-3 h-3" /> New formulation
        </button>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40"
          />
        </div>
      </div>

      {/* Filter chips + Legend */}
      <div className="px-5 py-2.5 border-b border-border bg-secondary flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5 items-center">
          <span className="text-[11px] text-muted-foreground">Filter:</span>
          {DOSAGE_FORMS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`filter-chip ${filter === c ? "filter-chip-active" : ""}`}
            >
              {c === "Arishta/Asava" ? "Arishta / Asava" : c === "Vati/Gutika" ? "Vati / Gutika" : c}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center ml-auto">
          {LEGEND_ITEMS.map((l) => (
            <div key={l.cat} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full app-badge ${CAT_BADGE[l.cat]}`} style={{ padding: 0, width: 8, height: 8, minWidth: 8 }} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="app-card mx-5 my-4">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                 <tr>
                   <th style={{ width: 28 }}></th>
                   <th>Formulation</th>
                   <th>Category</th>
                   <th>Dosage form</th>
                   <th>Key herbs (RM)</th>
                   <th>Pharmacopoeial ref</th>
                   <th>Therapeutic use</th>
                   <th>Shelf life</th>
                   <th style={{ width: 70 }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const isOpen = expandedIds.has(f.id);
                  const keyHerbs =
                    f.rm
                      .slice(0, 3)
                      .map((r) => r.name.split("(")[0].trim())
                      .join(", ") + (f.rm.length > 3 ? `, +${f.rm.length - 3} more` : "");
                  const isCustom = !f.isReference;
                  const stdBatch = `${f.standardBatchSize} ${f.standardBatchUnit}`;

                  return (
                    <>
                      <tr
                        key={f.id}
                        className="cursor-pointer"
                        onClick={() => toggle(f.id)}
                      >
                        <td>
                          <ChevronRight
                            className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                          />
                        </td>
                        <td>
                          <div className="font-medium">
                            {displayName(f.name, f.sanskrit)}
                            {isCustom && <span className="app-badge app-badge-teal text-[9px] ml-1">Custom</span>}
                          </div>
                          {isCustom && <div className="text-[10px] text-muted-foreground">Std batch: {stdBatch}</div>}
                          {f.sanskrit && f.sanskrit !== displayName(f.name, f.sanskrit) && (
                            <div className="text-[10px] text-muted-foreground italic">{f.sanskrit}</div>
                          )}
                        </td>
                        <td>
                          <span className={`app-badge ${TYPE_BADGE[f.type] || "app-badge-gray"}`}>{f.type}</span>
                        </td>
                        <td className="text-[11px] text-muted-foreground">{f.form}</td>
                        <td className="text-[11px] max-w-[200px]">{keyHerbs}</td>
                        <td className="text-[11px] text-muted-foreground">{f.ref}</td>
                        <td className="text-[11px] max-w-[180px]">{f.use}</td>
                        <td className="text-[11px] text-muted-foreground whitespace-nowrap">{f.shelf}</td>
                        <td>
                          {isCustom && (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => navigate(`/mfr-create?edit=${f.id}`)}
                                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete "${f.name}"?`)) {
                                    deleteFormulation(f.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`detail-${f.id}`}>
                          <td colSpan={9} className="!p-0">
                            <FormulationDetail f={f} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MFRTable;
