import { useEffect, useMemo } from "react";
import { BMRRecord, BMRIngredient, BMRLotAllocation } from "@/context/BMRContext";
import { useStock } from "@/context/StockContext";
import { useLanguage } from "@/context/LanguageContext";
import { Info, Lock, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
}

const CAT_BADGE: Record<string, string> = {
  herb: "app-badge-green", extract: "app-badge-amber", mineral: "app-badge-blue",
  animal: "app-badge-red", base: "app-badge-purple", process: "app-badge-teal",
};

const Step2Ingredients = ({ bmr, onChange }: Props) => {
  const { getActiveLotsForRM, consumeFromLots, commitConsumption } = useStock();
  const { displayName } = useLanguage();

  const updateIngredient = (idx: number, updates: Partial<BMRIngredient>) => {
    const ingredients = bmr.ingredients.map((ing, i) => i === idx ? { ...ing, ...updates } : ing);
    onChange({ ingredients });
  };

  // Auto-allocate FIFO for each ingredient that has rmCode and requiredQty.
  // Re-runs when stock changes so newly-added lots get picked up by previously-empty allocations.
  useEffect(() => {
    let mutated = false;
    const ingredients = bmr.ingredients.map((ing) => {
      if (ing.consumed) return ing;
      if (!ing.rmCode || !ing.requiredQty || ing.unit === "q.s.") return ing;
      const totalAlloc = (ing.allocations || []).reduce((s, a) => s + a.qty, 0);
      // Skip if already fully allocated
      if (ing.allocations && ing.allocations.length > 0 && totalAlloc >= ing.requiredQty - 0.0001) return ing;
      // Try (re)allocating — handles first render AND case where stock was empty before
      const lots = getActiveLotsForRM(ing.rmCode);
      if (lots.length === 0 && (ing.allocations?.length || 0) === 0) {
        // No stock — set empty allocations once so UI shows "No stock available"
        if (ing.allocations === undefined) {
          mutated = true;
          return { ...ing, allocations: [], shortfall: ing.requiredQty };
        }
        return ing;
      }
      const { allocations, shortfall } = consumeFromLots(ing.rmCode, ing.requiredQty);
      mutated = true;
      return { ...ing, allocations, shortfall };
    });
    if (mutated) onChange({ ingredients });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bmr.ingredients.length, bmr.ingredients.map(i => `${i.rmCode}:${i.requiredQty}`).join("|")]);

  const resetFIFO = (idx: number) => {
    const ing = bmr.ingredients[idx];
    if (!ing.rmCode) return;
    const { allocations, shortfall } = consumeFromLots(ing.rmCode, ing.requiredQty);
    updateIngredient(idx, { allocations, shortfall });
  };

  const updateAllocation = (idx: number, lotIdx: number, qty: number) => {
    const ing = bmr.ingredients[idx];
    const allocs = (ing.allocations || []).map((a, i) => i === lotIdx ? { ...a, qty } : a);
    const totalAlloc = allocs.reduce((s, a) => s + a.qty, 0);
    const shortfall = Math.max(0, parseFloat((ing.requiredQty - totalAlloc).toFixed(3)));
    updateIngredient(idx, { allocations: allocs, shortfall });
  };

  const swapLot = (idx: number, lotIdx: number, newLotId: string) => {
    const ing = bmr.ingredients[idx];
    if (!ing.rmCode) return;
    const lots = getActiveLotsForRM(ing.rmCode);
    const lot = lots.find(l => l.lotId === newLotId);
    if (!lot) return;
    const allocs = (ing.allocations || []).map((a, i) => i === lotIdx ? {
      lotId: lot.lotId, batchNo: lot.batchNo, expiry: lot.expiry, rate: lot.rate, qty: a.qty,
    } : a);
    updateIngredient(idx, { allocations: allocs });
  };

  const commit = (idx: number) => {
    const ing = bmr.ingredients[idx];
    if (!ing.rmCode || !ing.allocations?.length) return;
    if (ing.consumed) return;
    commitConsumption(bmr.batchNo, `BMR ${bmr.batchNo} (${bmr.productName})`, ing.rmCode, ing.name, ing.allocations);
    const totalAlloc = ing.allocations.reduce((s, a) => s + a.qty, 0);
    const lotsTxt = ing.allocations.map(a => a.batchNo).join(", ");
    updateIngredient(idx, {
      consumed: true,
      actualQty: ing.actualQty || totalAlloc,
      lot: lotsTxt,
      grnRef: lotsTxt,
      expiry: ing.allocations[0]?.expiry || ing.expiry,
    });
    toast.success(`${ing.name}: ${totalAlloc.toFixed(3)} ${bmr.batchUnit} deducted from ${ing.allocations.length} lot(s)`);
  };

  const getVariance = (ing: BMRIngredient) => {
    if (ing.unit === "q.s." || !ing.requiredQty) return { cls: "app-badge-green", label: "—" };
    const diff = ing.actualQty - ing.requiredQty;
    const pct = Math.abs(diff / ing.requiredQty * 100);
    if (Math.abs(diff) < 0.001) return { cls: "app-badge-green", label: "OK" };
    if (pct <= 2) return { cls: "app-badge-amber", label: `${diff > 0 ? "+" : ""}${pct.toFixed(1)}%` };
    return { cls: "app-badge-red", label: "FLAG" };
  };

  const totalRequired = bmr.ingredients.reduce((s, i) => s + (i.unit === "q.s." ? 0 : i.requiredQty), 0);
  const totalActual = bmr.ingredients.reduce((s, i) => s + (i.unit === "q.s." ? 0 : i.actualQty), 0);
  const anyShortfall = bmr.ingredients.some(i => (i.shortfall || 0) > 0.0001);

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>FIFO auto-allocation from oldest stock lots. Override per row if needed. Stock is deducted only when you click <span className="font-medium">Commit</span> per ingredient.</span>
      </div>

      {anyShortfall && (
        <div className="alert-box alert-warning mb-3">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Some ingredients have insufficient stock — partial allocation marked. Procurement required before release.</span>
        </div>
      )}

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Ingredient list — {bmr.productName} ({bmr.batchSize} {bmr.batchUnit} batch)</div>
        </div>
        <div className="overflow-x-auto">
          <table className="app-table text-[11px]">
            <thead>
              <tr>
                <th>#</th><th>RM name</th><th>Cat</th>
                <th>Reqd</th><th>FIFO allocation (lot · qty · exp)</th>
                <th>Actual</th><th>Weighed</th><th>Checked</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bmr.ingredients.map((ing, i) => {
                const v = getVariance(ing);
                const lots = ing.rmCode ? getActiveLotsForRM(ing.rmCode) : [];
                const totalAlloc = (ing.allocations || []).reduce((s, a) => s + a.qty, 0);
                const isShort = (ing.shortfall || 0) > 0.0001;
                return (
                  <tr key={i} className={ing.consumed ? "bg-secondary/40" : ""}>
                    <td className="text-muted-foreground align-top pt-2">{String(i + 1).padStart(2, "0")}</td>
                    <td className="align-top pt-2">
                      <div className="font-medium">{displayName(ing.name, ing.nameHi)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {ing.nameHi && ing.nameHi !== displayName(ing.name, ing.nameHi) ? `${ing.nameHi} · ` : ""}{ing.part}{ing.rmCode ? ` · ${ing.rmCode}` : " · no RM match"}
                      </div>
                    </td>
                    <td className="align-top pt-2"><span className={`app-badge ${CAT_BADGE[ing.cat] || "app-badge-gray"}`}>{ing.cat}</span></td>
                    <td className="align-top pt-2 font-semibold text-primary">
                      {ing.unit === "q.s." ? "q.s." : `${ing.requiredQty.toFixed(3)} ${bmr.batchUnit}`}
                    </td>
                    <td className="align-top">
                      {ing.unit === "q.s." ? (
                        <span className="text-[10px] text-muted-foreground">Quantity sufficient</span>
                      ) : !ing.rmCode ? (
                        <span className="text-[10px] text-warning">⚠ RM not in master — manual entry below</span>
                      ) : (
                        <div className="space-y-1">
                          {(ing.allocations || []).map((a, ai) => (
                            <div key={ai} className="flex items-center gap-1.5 text-[10px]">
                              <select
                                disabled={ing.consumed}
                                className="form-input-sm !text-[10px] flex-1 min-w-0"
                                value={a.lotId}
                                onChange={(e) => swapLot(i, ai, e.target.value)}
                              >
                                <option value={a.lotId}>{a.batchNo}</option>
                                {lots.filter(l => l.lotId !== a.lotId).map(l => (
                                  <option key={l.lotId} value={l.lotId}>{l.batchNo} (avail {l.qtyRemaining.toFixed(2)})</option>
                                ))}
                              </select>
                              <input
                                type="number" step="0.001" disabled={ing.consumed}
                                className="form-input-sm !text-[10px] w-16"
                                value={a.qty || ""}
                                onChange={(e) => updateAllocation(i, ai, Number(e.target.value))}
                              />
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">exp {a.expiry || "—"}</span>
                            </div>
                          ))}
                          {(!ing.allocations || ing.allocations.length === 0) && (
                            <span className="text-[10px] text-destructive">No stock available</span>
                          )}
                          <div className="flex items-center justify-between text-[9px] pt-0.5">
                            <span className="text-muted-foreground">Allocated: {totalAlloc.toFixed(3)}</span>
                            {isShort && <span className="text-destructive font-medium">Short by {(ing.shortfall || 0).toFixed(3)}</span>}
                            {!ing.consumed && (
                              <button onClick={() => resetFIFO(i)} className="flex items-center gap-0.5 text-primary hover:underline">
                                <RefreshCw className="w-2.5 h-2.5" /> FIFO
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="align-top pt-2">
                      <input type="number" className="form-input-sm w-20" value={ing.actualQty || ""} step="0.001" disabled={ing.consumed}
                        onChange={e => updateIngredient(i, { actualQty: Number(e.target.value) })} />
                    </td>
                    <td className="align-top pt-2">
                      <input className="form-input-sm w-20" value={ing.weighedBy || ""} disabled={ing.consumed}
                        onChange={e => updateIngredient(i, { weighedBy: e.target.value })} />
                    </td>
                    <td className="align-top pt-2">
                      <input className="form-input-sm w-20" value={ing.checkedBy || ""} disabled={ing.consumed}
                        onChange={e => updateIngredient(i, { checkedBy: e.target.value })} />
                    </td>
                    <td className="align-top pt-2">
                      {ing.consumed ? (
                        <span className="app-badge app-badge-teal flex items-center gap-1 w-fit"><Lock className="w-2.5 h-2.5" />Committed</span>
                      ) : ing.unit === "q.s." ? (
                        <span className={`app-badge ${v.cls}`}>{v.label}</span>
                      ) : ing.rmCode && (ing.allocations?.length || 0) > 0 ? (
                        <button
                          onClick={() => commit(i)}
                          disabled={!ing.weighedBy || !ing.checkedBy}
                          className="px-2 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                          title={!ing.weighedBy || !ing.checkedBy ? "Fill weighed-by + checked-by first" : "Deduct from stock"}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> Commit
                        </button>
                      ) : (
                        <span className={`app-badge ${v.cls}`}>{v.label}</span>
                      )}
                    </td>
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
