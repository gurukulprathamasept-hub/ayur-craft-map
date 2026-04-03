

## Plan: Make RM Master Functional with Add/Edit/Delete + QC, Linked to Stock & Inward

### Problem
- "Add RM" button in RM Master is static (no form/dialog)
- RM Master uses hardcoded local data instead of the shared `StockContext`
- RM Inward has hardcoded line items instead of letting users pick from the RM master list
- No QC specifications stored per RM (unlike MFR which has QC params)

### Changes

#### 1. Extend `RMEntry` type in `StockContext.tsx`
Add fields to `RMEntry`: `part` (part used), `shelf` (shelf life), `active` (status), and `qcSpecs` (array of `{parameter, spec}` objects -- same pattern as MFR's QC params). Add `addRM`, `updateRM`, `deleteRM` functions to the context. Seed the initial data with part/shelf/qc values for existing items.

#### 2. Rewrite `RMMaster.tsx`
- Connect to `StockContext` instead of local hardcoded array
- **Add RM dialog**: Multi-section form (similar to MFR Create's wizard but in a Dialog) with fields:
  - Basic: RM code (auto-generated), common name, botanical name, category (dropdown), part used, UOM, reorder level, shelf life, status toggle
  - QC Specifications: Dynamic rows with parameter + spec (e.g., "Moisture" / "<8%", "Ash value" / "≤10%", "Heavy metals" / "<10ppm")
- **Edit**: Click a row to open the same dialog pre-filled; save calls `updateRM`
- **Delete**: Trash icon with confirmation dialog; calls `deleteRM`
- Working search filter on name/botanical/code
- Category filter chips (already exist, will work with live data)

#### 3. Update `RMInward.tsx`
- Replace hardcoded line items with a dynamic "Add RM" button that opens a searchable dropdown of all RMs from `StockContext`
- Each added line: auto-fills RM name, UOM from master; user enters batch, expiry, qty, rate
- Users can add/remove lines before submitting
- Show RM's QC specs as a reference panel when a line is selected

#### 4. File changes summary
| File | Change |
|------|--------|
| `src/context/StockContext.tsx` | Add `part`, `shelf`, `active`, `qcSpecs` to `RMEntry`; add `addRM`, `updateRM`, `deleteRM` |
| `src/pages/RMMaster.tsx` | Full rewrite: consume StockContext, add/edit/delete dialogs with QC section |
| `src/pages/RMInward.tsx` | Dynamic line items from RM master, QC spec display |

