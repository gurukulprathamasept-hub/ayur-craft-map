import { BMRRecord, BMRIngredient } from "@/context/BMRContext";
import { Info } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const CAT_BADGE: Record<string, string> = {
  herb: "app-badge-green", extract: "app-badge-amber", mineral: "app-badge-blue",
  animal: "app-badge-red", base: "app-badge-purple", process: "app-badge-teal",
};

const Step2Ingredients = ({ bmr, onChange }: Props) => {
  const updateIngredient = (idx: number, updates: Partial<BMRIngredient>) => {
    const ingredients = bmr.ingredients.map((ing, i) => i === idx ? { ...ing, ...updates } : ing);
    onChange({ ingredients });
  };

  const getVariance = (ing: BMRIngredient) => {
    if (ing.unit === "q.s." || !ing.requiredQty) return { diff: 0, pct: 0, cls: "app-badge-green", label: "—" };
    const diff = ing.actualQty - ing.requiredQty;
    const pct = Math.abs(diff / ing.requiredQty * 100);
    if (Math.abs(diff) < 0.001) return { diff, pct, cls: "app-badge-green", label: "OK" };
    if (pct <= 2) return { diff, pct, cls: "app-badge-amber", label: `${diff > 0 ? "+" : ""}${pct.toFixed(1)}%` };
    return { diff, pct, cls: "app-badge-red", label: "FLAG" };
  };

  const totalRequired = bmr.ingredients.reduce((s, i) => s + (i.unit === "q.s." ? 0 : i.requiredQty), 0);
  const totalActual = bmr.ingredients.reduce((s, i) => s + (i.unit === "q.s." ? 0 : i.actualQty), 0);

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A.7 & 8: All ingredients, specifications, qty required for batch size, qty actually used. All weighings counter-checked by competent technical staff.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Ingredient list — {bmr.productName} ({bmr.batchSize} {bmr.batchUnit} batch)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="app-table text-[11px]">
            <thead>
              <tr>
                <th>#</th>
                <th>RM name</th>
                <th>Category</th>
                <th>AR/Control no.</th>
                <th>GRN ref.</th>
                <th>Expiry</th>
                <th>Reqd. qty</th>
                <th>Actual used</th>
                
                <th>Weighed by</th>
                <th>Checked by</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              {bmr.ingredients.map((ing, i) => {
                const v = getVariance(ing);
                const isExpiringSoon = ing.expiry && new Date(ing.expiry) <= new Date(Date.now() + 7 * 86400000);
                return (
                  <tr key={i}>
                    <td className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <div className="font-medium">{ing.name}</div>
                      <div className="text-[10px] text-muted-foreground">{ing.part}</div>
                    </td>
                    <td><span className={`app-badge ${CAT_BADGE[ing.cat] || "app-badge-gray"}`}>{ing.cat}</span></td>
                    <td>
                      <input className="form-input-sm w-24" value={ing.arControlNo || ""} onChange={e => updateIngredient(i, { arControlNo: e.target.value })} placeholder="AR/..." />
                    </td>
                    <td>
                      <input className="form-input-sm w-28" value={ing.grnRef || ""} onChange={e => updateIngredient(i, { grnRef: e.target.value })} placeholder="GRN-..." />
                    </td>
                    <td>
                      <input type="date" className={`form-input-sm w-28 ${isExpiringSoon ? "text-warning font-medium" : ""}`} value={ing.expiry || ""} onChange={e => updateIngredient(i, { expiry: e.target.value })} />
                    </td>
                    <td className="font-semibold text-primary">
                      {ing.unit === "q.s." ? "q.s." : ing.requiredQty.toFixed(3)}
                    </td>
                    <td>
                      <input type="number" className="form-input-sm w-24" value={ing.actualQty || ""} step="0.001"
                        onChange={e => updateIngredient(i, { actualQty: Number(e.target.value) })} />
                    </td>
                    <td>
                      <input className="form-input-sm w-24" value={ing.weighedBy || ""} onChange={e => updateIngredient(i, { weighedBy: e.target.value })} />
                    </td>
                    <td>
                      <input className="form-input-sm w-24" value={ing.checkedBy || ""} onChange={e => updateIngredient(i, { checkedBy: e.target.value })} />
                    </td>
                    <td><span className={`app-badge ${v.cls}`}>{v.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-3.5 py-2 border-t border-border flex gap-5 justify-end text-xs text-muted-foreground">
          <span>Total required: {totalRequired.toFixed(3)} {bmr.batchUnit}</span>
          <span>Total actual: <span className="font-medium text-foreground">{totalActual.toFixed(3)} {bmr.batchUnit}</span></span>
        </div>
      </div>

    </>
  );
};

export default Step2Ingredients;
