import { defineMcp } from "@lovable.dev/mcp-js";
import listFormulations from "./tools/list-formulations";
import getFormulation from "./tools/get-formulation";
import findFormulationsByIngredient from "./tools/find-formulations-by-ingredient";
import getComplianceReference from "./tools/get-compliance-reference";

export default defineMcp({
  name: "ayurmap-studio",
  title: "AyurMap Studio",
  version: "0.1.0",
  instructions:
    "Reference tools for AyurMap Studio, an Ayurvedic production management app. Use `list_formulations` to browse the built-in Master Formula Records, `get_formulation` for a full record (ingredients, sub-processes, process steps, QC parameters, packaging), `find_formulations_by_ingredient` for traceability questions about a dravya, and `get_compliance_reference` for raw-material categories, Schedule TA groups, dosage forms and sub-process types. These tools expose public reference data only — batch, stock and GRN records live in each user's browser and are not available here.",
  tools: [listFormulations, getFormulation, findFormulationsByIngredient, getComplianceReference],
});
