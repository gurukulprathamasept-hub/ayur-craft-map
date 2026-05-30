import type { RMCategory } from "@/context/FormulationContext";

export const CAT_BADGE: Record<RMCategory, string> = {
  herb: "app-badge-green",
  extract: "app-badge-amber",
  mineral: "app-badge-blue",
  animal: "app-badge-red",
  base: "app-badge-purple",
  process: "app-badge-teal",
};

export const CAT_LABELS: Record<string, string> = {
  herb: "Herbs",
  extract: "Extracts",
  mineral: "Metals & Minerals",
  animal: "Animal by-products",
  base: "Bases & Excipients",
  process: "Process agents",
};

export const TYPE_BADGE: Record<string, string> = {
  Churna: "app-badge-green",
  "Arishta/Asava": "app-badge-amber",
  Avaleha: "app-badge-red",
  Taila: "app-badge-blue",
  Ghrita: "app-badge-amber",
  "Vati/Gutika": "app-badge-purple",
  Bhasma: "app-badge-red",
};

export const DOSAGE_FORMS = ["All", "Churna", "Arishta/Asava", "Avaleha", "Taila", "Ghrita", "Vati/Gutika", "Bhasma"];

export const LEGEND_ITEMS: { cat: RMCategory; label: string }[] = [
  { cat: "herb", label: "Herb (Kasthausadhi)" },
  { cat: "extract", label: "Extract" },
  { cat: "mineral", label: "Metal/Mineral (Rasausadhi)" },
  { cat: "animal", label: "Animal by-product" },
  { cat: "base", label: "Base/Excipient" },
  { cat: "process", label: "Fermentation/Process agent" },
];
