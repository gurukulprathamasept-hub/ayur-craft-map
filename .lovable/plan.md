## Plan: RM Batch Numbers (auto), Batch Traceability, FIFO Consumption

### Goal
- Auto-generate logical RM batch numbers in GRN (e.g., `VIB-2504-0001` for Vibhitaki).
- Track inward stock as discrete batch lots (batchNo, qty remaining, expiry, rate, GRN ref).
- BMR Step 2 auto-allocates ingredients FIFO across available lots, with manual override and partial-allocation support.
- Stock ledger reflects batch-wise consumption (one outward txn per lot consumed) on Step 2 completion.

### Format
`{PREFIX}-YYMM-{seq}` where PREFIX = first 3 letters of RM name (uppercase), seq = 4-digit per-RM-per-month counter. Editable.

---

### 1. `src/context/StockContext.tsx`

**New types**
```ts
export type RMLot = {
  lotId: string;          // uuid
  batchNo: string;        // VIB-2504-0001
  rmCode: string;
  grnRef: string;
  receivedDate: string;
  expiry: string;
  rate: string;
  qtyReceived: number;
  qtyRemaining: number;   // FIFO drawdown
  status: "active" | "exhausted" | "reversed";
};
```
- Add `lots: RMLot[]` to provider state.
- `getNextRMBatchNo(rmCode, rmName)` → `{ batchNo, prevBatchNo }` scanning existing lots for the same `{prefix}-{yymm}` and incrementing.
- `getActiveLotsForRM(rmCode)` → lots with `qtyRemaining > 0`, sorted by `receivedDate` (FIFO).
- `consumeFromLots(rmCode, qty, refIssRef)` → returns `{ allocations: {lotId, batchNo, expiry, rate, qty}[], shortfall: number }`. Pure FIFO; no state mutation.
- `commitConsumption(issRef, source, allocations[])` → deducts `qtyRemaining` per lot, writes one Outward txn per lot to `RMEntry.txns`, appends `IssuedRecord` (extended to support per-lot lines).
- On `finalApproveGRN`: in addition to current behaviour, push an `RMLot` per approved line.
- On `reverseGRN`: also remove lots created by that GRN (and any allocations? — for now only allow reversal if `qtyRemaining === qtyReceived`; otherwise toast block).

### 2. `src/pages/RMInward.tsx` — auto-fill batch number
- When user picks an RM in a line item, call `getNextRMBatchNo(rmCode, rmName)` and pre-fill `line.batch` if empty.
- Show small hint: "Previous: VIB-2504-0002" or "First batch for this RM" below the batch input.
- Keep field editable.

### 3. `src/context/BMRContext.tsx` — extend ingredient model
```ts
export type BMRLotAllocation = {
  lotId: string;
  batchNo: string;
  expiry: string;
  rate: string;
  qty: number;
};
// add to BMRIngredient:
allocations?: BMRLotAllocation[];
shortfall?: number;
consumed?: boolean;   // true once Step 2 commit fires
```

### 4. `src/components/bmr/Step2Ingredients.tsx`
- On mount per ingredient (if `allocations` empty): call `consumeFromLots(rmCode, requiredQty)` and store proposed allocations.
- Render allocations under each row:
  - `VIB-2504-0001 — 5.000 kg  (exp Mar 2027)`
  - `VIB-2504-0002 — 2.000 kg  (exp Jun 2027)`
  - Each row inline-editable qty + batch dropdown (pick from active lots). "Reset to FIFO" button.
- Shortfall badge: red strip "Short by 1.200 kg — mark as pending" if not enough stock.
- "Commit consumption" button (or auto on `actualQty` confirm + `weighedBy` filled): calls `commitConsumption(bmr.batchNo, bmr.productName, allocations)` once and sets `ingredient.consumed = true`. Show locked state after commit.
- Block "Next step" if any ingredient has unresolved shortfall AND not explicitly marked pending.

### 5. `src/pages/StockLedger.tsx`
- No code changes needed — already renders all txns by ref. Outward entries from BMR will appear automatically with `ref = batchNo` (e.g. `CHY-2504-0001`).
- Optional: add a "Lots" sub-view per RM showing `RMLot[]` with `qtyRemaining` and source GRN.

### Files
| File | Change |
|------|--------|
| `src/context/StockContext.tsx` | Add `RMLot`, lot tracking, `getNextRMBatchNo`, FIFO `consumeFromLots`/`commitConsumption`, lot creation on GRN approval |
| `src/pages/RMInward.tsx` | Auto-fill batch no. on RM select, show previous-batch hint |
| `src/context/BMRContext.tsx` | Extend `BMRIngredient` with `allocations`, `shortfall`, `consumed` |
| `src/components/bmr/Step2Ingredients.tsx` | FIFO auto-allocate, manual override UI, shortfall handling, commit on weigh-completion |
| `src/pages/StockLedger.tsx` | (Optional) lots sub-view |

### Out of scope
- Persistence (still in-memory React state).
- Reversing a partially-consumed GRN (blocked with toast).
- Cross-batch substitution rules.
