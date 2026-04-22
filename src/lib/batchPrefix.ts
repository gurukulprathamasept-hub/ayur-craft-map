// Utilities for deriving and resolving unique batch-number prefixes for formulations.
//
// Priority order:
//   1. MFR code (e.g. "MFR-TCH-001") → middle segment "TCH"
//   2. Smart prefix from product name:
//        - 1 word  → first 4 letters        ("Chyawanprash"           → CHYA)
//        - 2 words → first 2 of each word   ("Triphala Churna"        → TRCH)
//        - 3+      → first letter of each   ("Mahasudarshan Ghan Vati"→ MGV)
//   3. Collision suffix: append a digit if another formulation already
//      uses the same prefix (TRC → TRC1, TRC2, ...).
//
// Final batch number format remains: {PREFIX}-YYMM-{4-digit-seq}

const clean = (s: string) => (s || "").replace(/[^A-Za-z]/g, "").toUpperCase();

/** Extract the middle alphabetic segment from an MFR code like "MFR-TCH-001". */
export function prefixFromMfrCode(code: string): string | null {
  if (!code) return null;
  const parts = code.split(/[-_/\s]+/).filter(Boolean);
  // Prefer the first segment that is purely alphabetic and not "MFR"
  const candidates = parts
    .map((p) => clean(p))
    .filter((p) => p.length >= 2 && p !== "MFR");
  if (candidates.length === 0) return null;
  // If the code starts with MFR, take the next segment; otherwise the first alpha one
  return candidates[0];
}

/** Smart prefix derived purely from the product name. */
export function prefixFromName(name: string): string {
  const words = (name || "")
    .split(/\s+/)
    .map((w) => clean(w))
    .filter(Boolean);

  if (words.length === 0) return "BAT";
  if (words.length === 1) return words[0].slice(0, 4) || "BAT";
  if (words.length === 2) {
    const a = words[0].slice(0, 2);
    const b = words[1].slice(0, 2);
    return (a + b) || "BAT";
  }
  // 3+ words → initials
  return words.map((w) => w[0]).join("").slice(0, 6) || "BAT";
}

/** Derive the base prefix using MFR code first, then name fallback. */
export function derivePrefix(name: string, mfrCode?: string): string {
  return prefixFromMfrCode(mfrCode || "") || prefixFromName(name);
}

/**
 * Resolve a unique prefix by checking against existing prefixes.
 * If `base` collides, suffix with 1, 2, 3, ... until unique.
 *
 * @param base       Candidate prefix (already uppercase)
 * @param existing   Set/array of prefixes already in use by *other* formulations
 */
export function resolveUniquePrefix(base: string, existing: Iterable<string>): string {
  const used = new Set<string>();
  for (const p of existing) if (p) used.add(p.toUpperCase());
  if (!used.has(base)) return base;
  let i = 1;
  while (used.has(`${base}${i}`)) i++;
  return `${base}${i}`;
}
