import { Search } from "lucide-react";
import { useState } from "react";

const categories = ["All", "Herb", "Extract", "Metal/Mineral", "Animal"];

const rmData = [
  { code: "RM-001", name: "Ashwagandha", botanical: "Withania somnifera", category: "Herb", part: "Root", uom: "kg", reorder: "5 kg", shelf: "36 mo", active: true },
  { code: "RM-002", name: "Amalaki / Amla", botanical: "Emblica officinalis", category: "Herb", part: "Fruit rind", uom: "kg", reorder: "10 kg", shelf: "24 mo", active: true },
  { code: "RM-003", name: "Haritaki", botanical: "Terminalia chebula", category: "Herb", part: "Fruit rind", uom: "kg", reorder: "8 kg", shelf: "24 mo", active: true },
  { code: "RM-012", name: "Shuddha Guggulu", botanical: "Commiphora wightii", category: "Extract", part: "Purified resin", uom: "kg", reorder: "3 kg", shelf: "60 mo", active: true },
  { code: "RM-027", name: "Abhraka (Shuddha)", botanical: "Mica / Biotite", category: "Metal/Mineral", part: "Shodhita flakes", uom: "kg", reorder: "500 g", shelf: "Indef.", active: true },
  { code: "RM-031", name: "Cow ghee", botanical: "Clarified butter (Ghrita)", category: "Animal", part: "Clarified butter", uom: "L", reorder: "5 L", shelf: "16 mo", active: true },
  { code: "RM-044", name: "Dhataki Pushpa", botanical: "Woodfordia fruticosa", category: "Herb", part: "Flower", uom: "kg", reorder: "1 kg", shelf: "18 mo", active: true },
];

const catBadge: Record<string, string> = {
  Herb: "app-badge-green",
  Extract: "app-badge-blue",
  "Metal/Mineral": "app-badge-purple",
  Animal: "app-badge-gray",
};

const RMMaster = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? rmData : rmData.filter((r) => r.category === filter);

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">RM master</div>
          <div className="text-[11px] text-muted-foreground mt-px">48 items · Last updated 12 Jun 2025</div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input type="search" placeholder="Search…" className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40" />
        </div>
        <button className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all">+ Add RM</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex gap-1.5 items-center mb-2.5">
          <span className="text-[11px] text-muted-foreground">Category:</span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`filter-chip ${filter === c ? "filter-chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="app-card">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th>RM code</th><th>Common name (AFI/API)</th><th>Botanical name</th><th>Category</th><th>Part used</th><th>UOM</th><th>Reorder</th><th>Shelf life</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rm) => (
                  <tr key={rm.code} className="cursor-pointer">
                    <td className="font-mono text-[11px]">{rm.code}</td>
                    <td className="font-medium">{rm.name}</td>
                    <td className="text-[11px] text-muted-foreground italic">{rm.botanical}</td>
                    <td><span className={`app-badge ${catBadge[rm.category] || "app-badge-gray"}`}>{rm.category}</span></td>
                    <td>{rm.part}</td>
                    <td>{rm.uom}</td>
                    <td>{rm.reorder}</td>
                    <td>{rm.shelf}</td>
                    <td><span className="app-badge app-badge-teal">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default RMMaster;
