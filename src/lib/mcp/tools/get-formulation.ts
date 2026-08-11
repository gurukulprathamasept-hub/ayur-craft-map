import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { detail, findFormulation } from "../data";

export default defineTool({
  name: "get_formulation",
  title: "Get formulation record",
  description:
    "Get the full reference Master Formula Record for one Ayurvedic formulation: ingredients with parts used, sub-processes (Kwatha/Kalka/Bhavana/Shodhana), process steps, QC parameters and packaging.",
  inputSchema: {
    formulation: z
      .string()
      .min(1)
      .describe('Formulation id or name, e.g. "Triphala Churna" or "ref-1".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ formulation }) => {
    const found = findFormulation(formulation);
    if (!found) throw new ToolError(`No reference formulation matches "${formulation}".`);
    const record = detail(found);
    return {
      content: [{ type: "text", text: JSON.stringify(record, null, 2) }],
      structuredContent: { formulation: record },
    };
  },
});
