

## Plan: Product-Specific Sequential Batch Numbers

### Problem
Batch numbers are currently random and generic. They should be specific to each formulation/product so each product has its own sequence (e.g., Chyawanprash → `CHY-2504-0001`, `CHY-2504-0002`; Triphala Churna → `TRI-2504-0001`).

### Changes

#### 1. `src/context/BMRContext.tsx` — Add `getNextBatchNo(productName, mfrId)`
- Generate a 3-letter prefix from the product name (first 3 uppercase letters, e.g., "Chyawanprash" → "CHY", "Triphala Churna" → "TRI")
- Scan existing BMRs filtered by `mfrId`, extract the highest sequence number
- Return next batch: `{PREFIX}-YYMM-{seq}` (e.g., `CHY-2504-0001`)
- Also return the previous batch number for that product (or null if first)

#### 2. `src/pages/BMRCreate.tsx` — Use product-specific batch number
- When a formulation is selected, call `getNextBatchNo(productName, mfrId)` to auto-generate the batch number
- Re-generate when the selected formulation changes
- Show "Previous batch: CHY-2504-0003" (or "First batch for this product") below the batch number input
- Batch number remains editable for manual override

### Files
| File | Change |
|------|--------|
| `src/context/BMRContext.tsx` | Add `getNextBatchNo(productName, mfrId)` returning `{nextBatchNo, prevBatchNo}` |
| `src/pages/BMRCreate.tsx` | Auto-generate on formulation selection, show previous batch info |

