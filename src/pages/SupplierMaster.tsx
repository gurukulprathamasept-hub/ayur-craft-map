import { Search, Pencil, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import { useSupplier, type Supplier } from "@/context/SupplierContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const sourceTypes = ["Trader", "Manufacturer", "Forest Collector", "Cultivator", "Importer"] as const;

const sourceBadge: Record<string, string> = {
  Trader: "app-badge-blue",
  Manufacturer: "app-badge-purple",
  "Forest Collector": "app-badge-green",
  Cultivator: "app-badge-teal",
  Importer: "app-badge-gray",
};

type FormData = Omit<Supplier, "id">;

const emptyForm: FormData = {
  name: "", contactPerson: "", phone: "", email: "", gst: "",
  address: "", city: "", state: "", pincode: "",
  sourceType: "Trader", drugLicenseNo: "", active: true,
};

const SupplierMaster = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSupplier();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const filtered = suppliers
    .filter(s => filterType === "All" || s.sourceType === filterType)
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q);
    });

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (s: Supplier) => {
    setEditId(s.id);
    const { id, ...rest } = s;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (editId) {
      updateSupplier(editId, form);
      toast({ title: "Supplier updated", description: `${form.name} saved.` });
    } else {
      addSupplier(form);
      toast({ title: "Supplier added", description: `${form.name} added.` });
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    const s = suppliers.find(x => x.id === deleteId);
    deleteSupplier(deleteId);
    toast({ title: "Supplier deleted", description: `${s?.name || deleteId} removed.` });
    setDeleteId(null);
  };

  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Supplier master</div>
          <div className="text-[11px] text-muted-foreground mt-px">{suppliers.length} suppliers</div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input type="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40" />
        </div>
        <button onClick={openAdd} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
          + Add Supplier
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex gap-1.5 items-center mb-2.5">
          <span className="text-[11px] text-muted-foreground">Source type:</span>
          {["All", ...sourceTypes].map(c => (
            <button key={c} onClick={() => setFilterType(c)}
              className={`filter-chip ${filterType === c ? "filter-chip-active" : ""}`}>{c}</button>
          ))}
        </div>

        <div className="app-card">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>ID</th><th>Supplier name</th><th>Contact</th><th>Phone</th>
                  <th>City</th><th>Source type</th><th>Drug Lic.</th><th>GST</th><th>Status</th><th className="w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => openEdit(s)}>
                    <td className="font-mono text-[11px]">{s.id}</td>
                    <td className="font-medium">{s.name}</td>
                    <td className="text-[11px]">{s.contactPerson}</td>
                    <td className="text-[11px]">{s.phone}</td>
                    <td className="text-[11px]">{s.city}, {s.state}</td>
                    <td><span className={`app-badge ${sourceBadge[s.sourceType] || "app-badge-gray"}`}>{s.sourceType}</span></td>
                    <td className="text-[11px] font-mono">{s.drugLicenseNo}</td>
                    <td className="text-[11px] font-mono">{s.gst}</td>
                    <td><span className={`app-badge ${s.active ? "app-badge-teal" : "app-badge-gray"}`}>{s.active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(s)} className="p-1 rounded hover:bg-secondary"><Pencil className="w-3 h-3 text-muted-foreground" /></button>
                        <button onClick={() => setDeleteId(s.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-8 text-muted-foreground text-xs">No suppliers found</td></tr>
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
            <DialogTitle>{editId ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>{editId ? `Editing ${editId}` : "Add a new supplier to the master list."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <label>Supplier name *</label>
                <input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Himalaya Herbs Traders" />
              </div>
              <div className="form-field">
                <label>Contact person</label>
                <input value={form.contactPerson} onChange={e => setField("contactPerson", e.target.value)} placeholder="e.g. Rajesh Sharma" />
              </div>
              <div className="form-field">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="e.g. 9876543210" />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input value={form.email} onChange={e => setField("email", e.target.value)} placeholder="e.g. info@supplier.com" />
              </div>
              <div className="form-field">
                <label>GST number</label>
                <input value={form.gst} onChange={e => setField("gst", e.target.value)} placeholder="e.g. 05AABCH1234A1Z5" />
              </div>
              <div className="form-field">
                <label>Drug license no.</label>
                <input value={form.drugLicenseNo} onChange={e => setField("drugLicenseNo", e.target.value)} placeholder="e.g. UK/2019/DL-4421" />
              </div>
              <div className="form-field col-span-2">
                <label>Address</label>
                <input value={form.address} onChange={e => setField("address", e.target.value)} placeholder="Street address" />
              </div>
              <div className="form-field">
                <label>City</label>
                <input value={form.city} onChange={e => setField("city", e.target.value)} placeholder="City" />
              </div>
              <div className="form-field">
                <label>State</label>
                <input value={form.state} onChange={e => setField("state", e.target.value)} placeholder="State" />
              </div>
              <div className="form-field">
                <label>Pincode</label>
                <input value={form.pincode} onChange={e => setField("pincode", e.target.value)} placeholder="Pincode" />
              </div>
              <div className="form-field">
                <label>Source type</label>
                <select value={form.sourceType} onChange={e => setField("sourceType", e.target.value as Supplier["sourceType"])}>
                  {sourceTypes.map(t => <option key={t}>{t}</option>)}
                </select>
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
          </div>

          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all">Cancel</button>
            <button onClick={handleSave} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">
              {editId ? "Save changes" : "Add Supplier"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{suppliers.find(s => s.id === deleteId)?.name}</strong> ({deleteId}) from the master list.
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

export default SupplierMaster;
