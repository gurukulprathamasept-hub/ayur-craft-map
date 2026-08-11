import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { referenceFormulations, summarise } from "../data";

export default defineTool({
  name: "list_formulations",
  title: "List reference formulations",
  description:
    "List the built-in Ayurvedic reference formulations (Master Formula Records) available in AyurMap Studio, optionally filtered by dosage form or a text query.",
  inputSchema: {
    dosageForm: z
      .string()
      .optional()
      .describe('Filter by dosage form, e.g. "Churna", "Taila", "Bhasma". Omit or "All" for every form.'),
    query: z.string().optional().describe("Free-text match on name, Sanskrit name or therapeutic use."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ dosageForm, query }) => {
    let rows = referenceFormulations;
    if (dosageForm && dosageForm.toLowerCase() !== "all") {
      const d = dosageForm.toLowerCase();
      rows = rows.filter((f) => f.type.toLowerCase().includes(d) || f.form.toLowerCase().includes(d));
    }
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.sanskrit.includes(query) ||
          f.use.toLowerCase().includes(q),
      );
    }
    const results = rows.map(summarise);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      structuredContent: { count: results.length, formulations: results },
    };
  },
});
