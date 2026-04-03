import { Search, Pencil, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useStock, type RMEntry, type QCSpec } from "@/context/StockContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const categories = ["All", "Herb", "Extract", "Metal/Mineral", "Animal"];
const categoryOptions = ["Herb", "Extract", "Metal/Mineral", "Animal"];
const uomOptions = ["kg", "g", "L", "mL", "nos"];

const catBadge: Record<string, string> = {
  Herb: "app-badge-green",
  Extract: "app-badge-blue",
  "Metal/Mineral": "app-badge-purple",
  Animal: "app-badge-gray",
};

type RMFormData = {
  name: string;
  botanical: string;
  category: string;
  part: string;
  uom: string;
  reorder: string;
  shelf: string;
  active: boolean;
  qcSpecs: QCSpec[];
};

const emptyForm: RMFormData = {
  name: "", botanical: "", category: "Herb", part: "", uom: "kg",
  reorder: "", shelf: "", active: true, qcSpecs: [{ parameter: "", spec: "" }],
};

const RMMaster = () => {
  const { rmData, addRM, updateRM, deleteRM } = useStock();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [form, setForm] = useState<RMFormData>(emptyForm);

  const filtered = rmData
    .filter(r => filter === "All" || r.category === filter)
    .filter(r => {
      if (!search) return true;
      const s = search.toLowerCase();
      return r.name.toLowerCase().includes(s) || r.botanical.toLowerCase().includes(s) || r.code.toLowerCase().includes(s);
    });

  const openAdd = () => {
    setEditCode(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (rm: RMEntry) => {
    setEditCode(rm.code);
    setForm({
      name: rm.name, botanical: rm.botanical, category: rm.category, part: rm.part,
      uom: rm.uom, reorder: String(rm.reorder), shelf: rm.shelf, active: rm.active,
      qcSpecs: rm.qcSpecs.length > 0 ? [...rm.qcSpecs] : [{ parameter: "", spec: "" }],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const cleanSpecs = form.qcSpecs.filter(s => s.parameter.trim() || s.spec.trim());
    const data = {
      name: form.name.trim(),
      botanical: form.botanical.trim(),
      category: form.category,
      part: form.part.trim(),
      uom: form.uom,
      reorder: parseFloat(form.reorder) || 0,
      shelf: form.shelf.trim(),
      active: form.active,
      qcSpecs: cleanSpecs,
    };
    if (editCode) {
      updateRM(editCode, data);
      toast({ title: "RM updated", description: `${data.name} saved.` });
    } else {
      addRM(data);
      toast({ title: "RM added", description: `${data.name} added to master.` });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteCode) return;
    const rm = rmData.find(r => r.code === deleteCode);
    deleteRM(deleteCode);
    toast({ title: "RM deleted", description: `${rm?.name || deleteCode} removed.` });
    setDeleteCode(null);
  };

  const setField = <K extends keyof RMFormData>(k: K, v: RMFormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const updateSpec = (i: number, field: keyof QCSpec, val: string) => {
    setForm(prev => {
      const specs = [...prev.qcSpecs];
      specs[i] = { ...specs[i], [field]: val };
      return { ...prev, qcSpecs: specs };
    });
  };

  const addSpec = () => setForm(prev => ({ ...prev, qcSpecs: [...prev.qcSpecs, { parameter: "", spec: "" }] }));
  const removeSpec = (i: number) => setForm(prev => ({ ...prev, qcSpecs: prev.qcSpecs.filter((_, idx) => idx !== i) }));

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM master</div>
          <div className="text-[11px] text-muted-foreground mt-px">{rmData.length} items</div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40"
          />
        </div>
        <button onClick={openAdd} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
          + Add RM
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex gap-1.5 items-center mb-2.5">
          <span className="text-[11px] text-muted-foreground">Category:</span>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`filter-chip ${filter === c ? "filter-chip-active" : ""}`}>{c}</button>
          ))}
        </div>

        <div className="app-card">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>RM code</th><th>Common name</th><th>Botanical name</th><th>Category</th>
                  <th>Part used</th><th>UOM</th><th>Reorder</th><th>Shelf life</th><th>QC</th><th>Status</th><th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rm => (
                  <tr key={rm.code} className="cursor-pointer" onClick={() => openEdit(rm)}>
                    <td className="font-mono text-[11px]">{rm.code}</td>
                    <td className="font-medium">{rm.name}</td>
                    <td className="text-[11px] text-muted-foreground italic">{rm.botanical}</td>
                    <td><span className={`app-badge ${catBadge[rm.category] || "app-badge-gray"}`}>{rm.category}</span></td>
                    <td>{rm.part}</td>
                    <td>{rm.uom}</td>
                    <td>{rm.reorder} {rm.uom}</td>
                    <td>{rm.shelf}</td>
                    <td>
                      {rm.qcSpecs.length > 0 ? (
                        <span className="app-badge app-badge-blue">{rm.qcSpecs.length} params</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td><span className={`app-badge ${rm.active ? "app-badge-teal" : "app-badge-gray"}`}>{rm.active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(rm)} className="p-1 rounded hover:bg-secondary"><Pencil className="w-3 h-3 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteCode(rm.code)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="text-center py-8 text-muted-foreground text-xs">No raw materials found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editCode ? "Edit Raw Material" : "Add Raw Material"}</DialogTitle>
            <DialogDescription>{editCode ? `Editing ${editCode}` : "Fill in details to add a new raw material to the master list."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <label>Common name (AFI/API) *</label>
                <input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Ashwagandha" />
              </div>
              <div className="form-field">
                <label>Botanical / scientific name</label>
                <input value={form.botanical} onChange={e => setField("botanical", e.target.value)} placeholder="e.g. Withania somnifera" />
              </div>
              <div className="form-field">
                <label>Category</label>
                <select value={form.category} onChange={e => setField("category", e.target.value)}>
                  {categoryOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Part used</label>
                <input value={form.part} onChange={e => setField("part", e.target.value)} placeholder="e.g. Root, Fruit rind" />
              </div>
              <div className="form-field">
                <label>UOM</label>
                <select value={form.uom} onChange={e => setField("uom", e.target.value)}>
                  {uomOptions.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Reorder level</label>
                <input type="number" value={form.reorder} onChange={e => setField("reorder", e.target.value)} placeholder="e.g. 5" />
              </div>
              <div className="form-field">
                <label>Shelf life</label>
                <input value={form.shelf} onChange={e => setField("shelf", e.target.value)} placeholder="e.g. 36 mo" />
              </div>
              <div className="form-field">
                <label>Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setField("active", !form.active)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${form.active ? "bg-primary" : "bg-muted"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${form.active ? "translate-x-4" : ""}`} />
                  </button>
                  <span className="text-xs">{form.active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            {/* QC Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">QC Specifications</label>
                <button onClick={addSpec} className="flex items-center gap-1 text-[11px] text-primary hover:underline">
                  <Plus className="w-3 h-3" /> Add parameter
                </button>
              </div>
              <div className="space-y-1.5">
                {form.qcSpecs.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className="flex-1 px-2 py-1.5 border border-border rounded-md text-xs" placeholder="Parameter (e.g. Moisture)"
                      value={spec.parameter} onChange={e => updateSpec(i, "parameter", e.target.value)} />
                    <input className="flex-1 px-2 py-1.5 border border-border rounded-md text-xs" placeholder="Specification (e.g. ≤8%)"
                      value={spec.spec} onChange={e => updateSpec(i, "spec", e.target.value)} />
                    {form.qcSpecs.length > 1 && (
                      <button onClick={() => removeSpec(i)} className="p-1 rounded hover:bg-destructive/10">
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
            <button onClick={handleSave} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              {editCode ? "Save changes" : "Add RM"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteCode} onOpenChange={open => !open && setDeleteCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete raw material?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{rmData.find(r => r.code === deleteCode)?.name}</strong> ({deleteCode}) from the master list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RMMaster;
