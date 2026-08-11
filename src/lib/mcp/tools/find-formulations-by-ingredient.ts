import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CAT_LABELS, referenceFormulations } from "../data";

export default defineTool({
  name: "find_formulations_by_ingredient",
  title: "Find formulations by ingredient",
  description:
    "Find which reference Ayurvedic formulations use a given raw material (dravya), matching on common or botanical name. Useful for traceability and substitution questions.",
  inputSchema: {
    ingredient: z
      .string()
      .min(2)
      .describe('Raw material name or part of it, e.g. "Haritaki", "Terminalia", "Guduchi".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ ingredient }) => {
    const q = ingredient.trim().toLowerCase();
    const matches = referenceFormulations
      .map((f) => {
        const hits = [
          ...f.rm,
          ...(f.subProcesses ?? []).flatMap((sp) => sp.ingredients),
        ].filter(
          (rm) =>
            rm.name.toLowerCase().includes(q) ||
            (rm.botanical ?? "").toLowerCase().includes(q),
        );
        return { f, hits };
      })
      .filter((m) => m.hits.length > 0)
      .map(({ f, hits }) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        pharmacopoeialReference: f.ref,
        matchedIngredients: hits.map((rm) => ({
          name: rm.name,
          category: rm.cat,
          categoryLabel: CAT_LABELS[rm.cat] ?? rm.cat,
          quantity: rm.qty > 0 ? `${rm.qty} ${rm.unit}` : rm.unit,
          partUsed: rm.part,
        })),
      }));

    return {
      content: [
        {
          type: "text",
          text:
            matches.length === 0
              ? `No reference formulation uses an ingredient matching "${ingredient}".`
              : JSON.stringify(matches, null, 2),
        },
      ],
      structuredContent: { count: matches.length, formulations: matches },
    };
  },
});
