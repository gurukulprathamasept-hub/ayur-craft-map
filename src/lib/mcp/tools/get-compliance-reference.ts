import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CAT_LABELS, DOSAGE_FORMS } from "../data";

const SCHEDULE_TA_CATEGORIES = [
  { key: "herb", scheduleTaGroup: "Herbs (Kasthausadhi)", note: "Plant-origin dravyas; recorded with part used and supplier source." },
  { key: "extract", scheduleTaGroup: "Herbs (Kasthausadhi)", note: "Standardised plant extracts; recorded with marker assay." },
  { key: "mineral", scheduleTaGroup: "Metals & Minerals (Rasausadhi)", note: "Requires Shodhana purification records before use." },
  { key: "animal", scheduleTaGroup: "Animal by-products", note: "Requires source declaration and traceability." },
  { key: "base", scheduleTaGroup: "Bases & Excipients", note: "Oils, ghrita, sugars, honey and other vehicles." },
  { key: "process", scheduleTaGroup: "Process agents", note: "Fermentation and processing aids; not part of final label claim." },
];

const SUB_PROCESS_TYPES = [
  { type: "Kwatha", meaning: "Decoction — herbs boiled with water and reduced to a target fraction." },
  { type: "Kalka", meaning: "Wet paste of fresh or soaked dravyas used as an intermediate." },
  { type: "Bhavana", meaning: "Repeated levigation/trituration cycles with a liquid medium." },
  { type: "Shodhana", meaning: "Purification of metals/minerals through defined cycles before use." },
  { type: "Other", meaning: "Any other named intermediate preparation." },
];

export default defineTool({
  name: "get_compliance_reference",
  title: "Get compliance reference",
  description:
    "Return AyurMap Studio's compliance reference metadata: raw material categories and their Schedule TA reporting groups, dosage forms, and Ayurvedic sub-process (intermediate preparation) types.",
  inputSchema: {
    section: z
      .enum(["all", "categories", "dosageForms", "subProcesses"])
      .optional()
      .describe('Which section to return. Defaults to "all".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ section }) => {
    const which = section ?? "all";
    const payload: Record<string, unknown> = {};
    if (which === "all" || which === "categories") {
      payload.rawMaterialCategories = SCHEDULE_TA_CATEGORIES.map((c) => ({
        ...c,
        label: CAT_LABELS[c.key] ?? c.key,
      }));
    }
    if (which === "all" || which === "dosageForms") {
      payload.dosageForms = DOSAGE_FORMS.filter((d) => d !== "All");
    }
    if (which === "all" || which === "subProcesses") {
      payload.subProcessTypes = SUB_PROCESS_TYPES;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
