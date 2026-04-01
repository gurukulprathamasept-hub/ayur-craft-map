import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search, Plus, FileText } from "lucide-react";
import { useFormulations, Formulation as CustomFormulation } from "@/context/FormulationContext";

type RMCategory = "herb" | "extract" | "mineral" | "animal" | "base" | "process";

interface RMItem {
  name: string;
  cat: RMCategory;
  qty: string;
  part: string;
}

interface Formulation {
  id: number | string;
  name: string;
  sanskrit: string;
  type: string;
  form: string;
  ref: string;
  use: string;
  shelf: string;
  rm: RMItem[];
  steps: string[];
  qc: string[];
  ipc: string;
  dosha: string;
  _custom?: boolean;
  _customId?: string;
  _stdBatch?: string;
}

const CAT_BADGE: Record<RMCategory, string> = {
  herb: "app-badge-green",
  extract: "app-badge-amber",
  mineral: "app-badge-blue",
  animal: "app-badge-red",
  base: "app-badge-purple",
  process: "app-badge-teal",
};

const CAT_LABELS: Record<string, string> = {
  herb: "Herbs",
  extract: "Extracts",
  mineral: "Metals & Minerals",
  animal: "Animal by-products",
  base: "Bases & Excipients",
  process: "Process agents",
};

const TYPE_BADGE: Record<string, string> = {
  Churna: "app-badge-green",
  "Arishta/Asava": "app-badge-amber",
  Avaleha: "app-badge-red",
  Taila: "app-badge-blue",
  Ghrita: "app-badge-amber",
  "Vati/Gutika": "app-badge-purple",
  Bhasma: "app-badge-red",
};

const dosageForms = ["All", "Churna", "Arishta/Asava", "Avaleha", "Taila", "Ghrita", "Vati/Gutika", "Bhasma"];

const data: Formulation[] = [
  {
    id: 1, name: "Triphala Churna", sanskrit: "त्रिफला चूर्ण", type: "Churna",
    form: "Fine powder (≥80 mesh)", ref: "AFI Vol.I; API Part I", use: "Digestive tonic, laxative, Rasayana, eye health, detox",
    shelf: "2 years (airtight)",
    rm: [
      { name: "Amalaki / Amla fruit (Emblica officinalis)", cat: "herb", qty: "33.33%", part: "Dried fruit rind" },
      { name: "Haritaki (Terminalia chebula)", cat: "herb", qty: "33.33%", part: "Dried fruit rind" },
      { name: "Vibhitaki / Bibhitaki (Terminalia bellirica)", cat: "herb", qty: "33.33%", part: "Dried fruit rind" },
    ],
    steps: [
      "Raw material inspection — verify botanical identity, moisture <12%",
      "Remove seeds/kernels; retain fruit rind only",
      "Sun-dry or shade-dry rind to <8% moisture; no high-heat drying",
      "Grind each fruit separately in pulveriser",
      "Sieve through 80-mesh screen individually",
      "Weigh accurately in 1:1:1 ratio (by AFI default: Sharangdhara Samhita rule)",
      "Blend in double-cone blender or mechanical mixer until homogenous",
      "QC sample; pass organoleptic and physicochemical tests",
      "Fill in airtight HDPE containers; seal and label with batch no. + expiry",
    ],
    qc: ["Moisture <8%", "Ash value ≤10% w/w", "pH (10% aq.) 3.5–5.0", "TLC fingerprint (gallic acid)", "Heavy metals <10ppm Pb", "Microbial count <10⁵ CFU/g", "Tannin content ≥3% w/w"],
    ipc: "Particle size uniformity at each sieve step; blend uniformity check",
    dosha: "Tridoshic (all three doshas balanced)",
  },
  {
    id: 2, name: "Chyawanprash Avaleha", sanskrit: "च्यवनप्राश अवलेह", type: "Avaleha",
    form: "Semi-solid jam / linctus", ref: "Charaka Samhita Chikitsa 1/1; AFI Vol.II", use: "Rasayana, immunity, respiratory health, anti-aging, vitality",
    shelf: "3 years",
    rm: [
      { name: "Amla / Amalaki (Emblica officinalis)", cat: "herb", qty: "1 kg fresh (main)", part: "Fresh fruit" },
      { name: "Ashwagandha (Withania somnifera)", cat: "herb", qty: "As per formula", part: "Root" },
      { name: "Shatavari (Asparagus racemosus)", cat: "herb", qty: "As per formula", part: "Root tuber" },
      { name: "Guduchi / Giloy (Tinospora cordifolia)", cat: "herb", qty: "As per formula", part: "Stem" },
      { name: "Pippali / Long pepper (Piper longum)", cat: "herb", qty: "As per formula", part: "Fruit" },
      { name: "Sugar candy / Mishri (Sita)", cat: "base", qty: "~2.5 kg", part: "Processed sugar" },
      { name: "Sesame oil (Til taila)", cat: "base", qty: "300 g", part: "Cold-pressed oil" },
      { name: "Cow ghee (Ghrita)", cat: "animal", qty: "300 g", part: "Clarified butter" },
      { name: "Honey (Madhu)", cat: "animal", qty: "Added cold", part: "Bee honey — added after cooling" },
    ],
    steps: [
      "Prepare decoction (Kasaya): boil ~50 herbs in 16× water; reduce to 1/4 volume; strain",
      "Wash, peel and boil Amla fruits in the decoction until soft",
      "Remove Amla seeds; pound pulp to smooth paste",
      "Heat sesame oil and ghee together in SS vessel",
      "Fry Amla pulp in oil+ghee mixture until colour changes and fat separates — \"Sneha\" test",
      "Transfer fried pulp to decoction; add sugar candy and heat on low flame",
      "Stir continuously until semi-solid linctus consistency (Avaleha paka — string test)",
      "Cool to below 40°C; add honey and powder spices (Prakshepa Dravyas)",
      "Mix thoroughly; fill hot in glass/HDPE jars; seal and label",
    ],
    qc: ["Total solids ≥70% w/w", "pH 4.0–5.5", "Vitamin C ≥0.5 mg/g", "Moisture <20%", "Heavy metals Pb <10ppm", "Microbial <10⁴ CFU/g"],
    ipc: "Paka consistency (string test); temperature <40°C before honey addition",
    dosha: "Tridoshic; primarily Vata-Pitta balancing",
  },
  {
    id: 3, name: "Ashwagandharishta", sanskrit: "अश्वगन्धारिष्ट", type: "Arishta/Asava",
    form: "Fermented liquid (alcohol 5–10%)", ref: "AFI Vol.I; Bhaishajya Ratnavali", use: "Stress, fatigue, Vata disorders, rejuvenation, nervine tonic",
    shelf: "Indefinite",
    rm: [
      { name: "Ashwagandha (Withania somnifera)", cat: "herb", qty: "4.8 kg", part: "Root powder" },
      { name: "Mustak (Cyperus rotundus)", cat: "herb", qty: "960 g", part: "Rhizome" },
      { name: "Haritaki (Terminalia chebula)", cat: "herb", qty: "960 g", part: "Fruit" },
      { name: "Manjishtha (Rubia cordifolia)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Jaggery (Guda)", cat: "base", qty: "9.6 kg", part: "Fermentation substrate" },
      { name: "Dhataki Pushpa (Woodfordia fruticosa)", cat: "process", qty: "480 g", part: "Fermentation initiator" },
      { name: "Water", cat: "base", qty: "49.152 L", part: "Decoction medium" },
    ],
    steps: [
      "Prepare Kasaya: coarse-powder herbs, boil in 49 L water; reduce to 12 L (1/4); strain and cool",
      "Transfer decoction to fermentation vessel; fumigate vessel with Pippali churna + ghee",
      "Dissolve jaggery in warm decoction; stir to dissolve",
      "Add Dhataki Pushpa and Prakshepa Dravyas",
      "Seal vessel mouth with clay-smeared cloth in 7 layers (Sandhana)",
      "Store at 25–30°C for 1 month",
      "Test: clear liquid, aromatic, candle test, no effervescence",
      "Filter through muslin and 5μ filter",
      "Measure alcohol (5–10% v/v); fill in glass/HDPE bottles under nitrogen",
    ],
    qc: ["Alcohol 5–10% v/v", "Total solids ≥3% w/v", "pH 3.5–4.5", "Clear liquid, no froth", "Microbial <10⁴ CFU/ml", "Heavy metals within limits"],
    ipc: "Daily fermentation monitoring: pH, temperature, smell; Candle test at 15 and 30 days",
    dosha: "Primarily Vata-balancing",
  },
  {
    id: 4, name: "Sitopaladi Churna", sanskrit: "सितोपलादि चूर्ण", type: "Churna",
    form: "Fine powder (≥80 mesh)", ref: "Bhaishajya Ratnavali; AFI", use: "Cough, cold, bronchitis, fever, respiratory disorders",
    shelf: "2 years",
    rm: [
      { name: "Sitopala / Mishri (Sugar candy)", cat: "base", qty: "16 parts", part: "Unrefined sugar candy" },
      { name: "Vamsha Rochana (Bamboo silica)", cat: "mineral", qty: "8 parts", part: "Bamboo secretion" },
      { name: "Pippali / Long pepper (Piper longum)", cat: "herb", qty: "4 parts", part: "Fruit" },
      { name: "Ela / Cardamom (Elettaria cardamomum)", cat: "herb", qty: "2 parts", part: "Seed" },
      { name: "Twak / Dalchini (Cinnamomum verum)", cat: "herb", qty: "1 part", part: "Bark" },
    ],
    steps: [
      "Verify botanical identity and moisture (<12%) of all RM",
      "Grind Pippali, Ela, Twak separately to fine powder; pass through 80-mesh sieve",
      "Powder Vamsha Rochana; sieve",
      "Powder Sitopala separately to fine granules; sieve",
      "Weigh in correct ratio (16:8:4:2:1)",
      "Blend in double-cone blender: start with smaller quantities, gradually add larger",
      "Check blend uniformity — assay piperine content",
      "QC sample: physicochemical and microbial testing",
      "Fill in amber glass or HDPE airtight containers; insert desiccant",
    ],
    qc: ["Moisture <8%", "Ash <5% w/w", "Piperine NLT 0.1% w/w", "TLC fingerprint match", "Heavy metals within limits", "Microbial <10⁵ CFU/g"],
    ipc: "Blend uniformity; particle size check; organoleptic (sweet-spicy taste)",
    dosha: "Kapha-Pitta balancing",
  },
  {
    id: 5, name: "Mahanarayan Taila", sanskrit: "महानारायण तैल", type: "Taila",
    form: "Medicated oil (Sneha Kalpana)", ref: "Sahasrayoga; AFI Vol.I", use: "Joint pain, arthritis, muscle weakness, paralysis",
    shelf: "3 years",
    rm: [
      { name: "Bilva root (Aegle marmelos)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Ashwagandha (Withania somnifera)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Bala (Sida cordifolia)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Shatavari (Asparagus racemosus)", cat: "herb", qty: "960 g", part: "Root tuber" },
      { name: "Dashamoola group (10 roots)", cat: "herb", qty: "960 g each", part: "Root" },
      { name: "Sesame oil (Til Taila)", cat: "base", qty: "9.6 L", part: "Cold-pressed seed oil" },
      { name: "Cow ghee (Ghrita)", cat: "animal", qty: "As per formula", part: "Clarified butter" },
      { name: "Water for decoction", cat: "base", qty: "98 L → 24.5 L", part: "Decoction medium" },
    ],
    steps: [
      "Shodhana: clean and dry all herbs; reject damaged material",
      "Coarse-powder herbs; add to 98 L water; boil to 24.5 L (1/4); filter",
      "Prepare Kalka: grind designated herbs with water to fine paste",
      "Combine: sesame oil + ghee + Kalka + strained decoction",
      "Ratio: oil 1 : kalka 1/4 : liquid 4",
      "Heat on medium flame; stir continuously (Mantha)",
      "Observe Paka Lakshanas: clear froth subsides; Varti test",
      "Filter while hot through multi-layer muslin",
      "Cool, measure refractive index and specific gravity; fill in amber bottles",
    ],
    qc: ["Refractive index 1.470–1.475", "Sp. gravity 0.900–0.910", "Acid value <5", "Saponification value 185–200", "Rancidity: neg", "Heavy metals within limits"],
    ipc: "Varti test; Madhyama Paka determination; temperature monitoring",
    dosha: "Vata-pacifying; suitable for Abhyanga and Snehapana",
  },
  {
    id: 6, name: "Brahmi Ghrita", sanskrit: "ब्राह्मी घृत", type: "Ghrita",
    form: "Medicated clarified butter", ref: "Ashtanga Hridayam Uttarsthana 6/23-25", use: "Memory, intelligence, speech, epilepsy, Panchakarma",
    shelf: "16 months",
    rm: [
      { name: "Brahmi (Bacopa monnieri)", cat: "herb", qty: "1.536 L juice", part: "Whole plant juice (Swarasa)" },
      { name: "Cow ghee (Ghrita)", cat: "animal", qty: "768 ml", part: "Base — clarified butter" },
      { name: "Trikatu — Ginger", cat: "herb", qty: "12 g", part: "Rhizome" },
      { name: "Trikatu — Black pepper", cat: "herb", qty: "12 g", part: "Fruit" },
      { name: "Trikatu — Long pepper", cat: "herb", qty: "12 g", part: "Fruit" },
      { name: "Shankhapushpi (Clitorea ternatea)", cat: "herb", qty: "As per formula", part: "Whole plant" },
    ],
    steps: [
      "Extract fresh Brahmi Swarasa: wash, crush, press through muslin",
      "Prepare Kalka: powder all dry herbs; add water to form paste",
      "Combine: Cow ghee + Brahmi juice + Kalka paste",
      "Ratio: ghee 1 : kalka 1/4 : liquid 4",
      "Heat on medium flame; stir continuously",
      "Observe Varti/Paka Lakshana: kalka forms smooth wick, no crackling, no smoke",
      "All moisture must evaporate — Madhyama Paka endpoint",
      "Filter through multilayer muslin while hot",
      "Cool; assess organoleptic; measure specific gravity",
      "Fill in amber glass jars; seal; store cool and dry",
    ],
    qc: ["Sp. gravity 0.900–0.915", "Moisture: nil", "Acid value <5.6", "Saponification value 220–235", "Bacopa alkaloids — TLC/HPTLC", "Rancidity: neg"],
    ipc: "Paka Lakshana (Varti test); Brahmi juice ratio verification; Swarasa freshness",
    dosha: "Vata-Pitta balancing; Medhya Rasayana",
  },
  {
    id: 7, name: "Trikatu Churna", sanskrit: "त्रिकटु चूर्ण", type: "Churna",
    form: "Fine powder (≥80 mesh)", ref: "Charaka Samhita; AFI", use: "Digestive fire, obesity, asthma, cough, arthritis, indigestion",
    shelf: "2 years",
    rm: [
      { name: "Shunthi / Dry Ginger (Zingiber officinale)", cat: "herb", qty: "1 part", part: "Dried rhizome" },
      { name: "Maricha / Black pepper (Piper nigrum)", cat: "herb", qty: "1 part", part: "Fruit" },
      { name: "Pippali / Long pepper (Piper longum)", cat: "herb", qty: "1 part", part: "Fruit" },
    ],
    steps: [
      "Procure authenticated dried ginger, black pepper, long pepper",
      "Check moisture (<12%) and pungency (organoleptic)",
      "Grind each separately in pulveriser to fine powder",
      "Sieve individually through 80-mesh; discard residue or re-grind",
      "Weigh equal quantities (1:1:1) with precision balance",
      "Blend uniformly in mixer for ≥15 minutes",
      "Check piperine content (HPLC/TLC)",
      "Fill in airtight amber glass or HDPE containers",
      "Label with manufacturing and expiry date",
    ],
    qc: ["Moisture <8%", "Total ash <7% w/w", "Piperine NLT 0.5% w/w", "Gingerol presence — TLC", "Microbial <10⁵ CFU/g"],
    ipc: "Blend uniformity test; organoleptic at every batch; piperine assay",
    dosha: "Kapha-Vata reducing; Deepana-Pachana",
  },
  {
    id: 8, name: "Dashamoolarishta", sanskrit: "दशमूलारिष्ट", type: "Arishta/Asava",
    form: "Fermented decoction (alcohol 5–10%)", ref: "AFI Vol.I; Charaka Samhita", use: "Vata disorders, post-partum weakness, rheumatism, fever",
    shelf: "Indefinite",
    rm: [
      { name: "Bilva (Aegle marmelos)", cat: "herb", qty: "960 g", part: "Root bark" },
      { name: "Shyonaka (Oroxylum indicum)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Gambhari (Gmelina arborea)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Gokshura (Tribulus terrestris)", cat: "herb", qty: "960 g", part: "Root" },
      { name: "Jaggery (Guda)", cat: "base", qty: "9.6 kg", part: "Fermentation substrate" },
      { name: "Dhataki Pushpa (Woodfordia fruticosa)", cat: "process", qty: "480 g", part: "Fermentation initiator" },
    ],
    steps: [
      "Collect and authenticate all 10 Dashamoola roots",
      "Coarse-powder all roots; prepare Kasaya in 16× water; reduce to 1/4; filter",
      "Cool to 40°C; transfer to fumigated fermentation vessel",
      "Dissolve jaggery; add Dhataki Pushpa; seal with 7-layer clay cloth",
      "Ferment at 25–30°C for 30 days; check daily",
      "Candle test on day 28: flame burns brightly = complete",
      "Drain; filter through muslin (5μ secondary); settle 3 days",
      "Measure alcohol (5–10%), pH, total solids",
      "Fill in glass bottles under N₂; quarantine 7 days; release on QC approval",
    ],
    qc: ["Alcohol 5–10% v/v", "pH 3.5–4.5", "Total solids ≥5% w/v", "Clear, dark brown, no froth", "Microbial <10⁴ CFU/ml"],
    ipc: "Daily fermentation log; pH curve; candle test on day 15 and 28",
    dosha: "Vata-Kapha balancing",
  },
  {
    id: 9, name: "Guggulu Vati (Triphala Guggulu)", sanskrit: "त्रिफला गुग्गुलु", type: "Vati/Gutika",
    form: "Tablet / Pill (Vati)", ref: "Sharangdhara Samhita; AFI", use: "Fistula, piles, skin diseases, Vata-Kapha disorders, obesity",
    shelf: "Indefinite",
    rm: [
      { name: "Triphala (Amla + Haritaki + Bibhitaki)", cat: "herb", qty: "Equal parts", part: "Fruit powder" },
      { name: "Shuddha Guggulu (Commiphora wightii)", cat: "extract", qty: "Equal to Triphala", part: "Purified resin" },
      { name: "Pippali (Piper longum)", cat: "herb", qty: "1 part", part: "Fruit" },
      { name: "Water / Triphala Kwatha", cat: "base", qty: "Sufficient", part: "Binding liquid" },
    ],
    steps: [
      "Shodhana of Guggulu: melt in Triphala decoction; filter; dry; repeat 3×",
      "Prepare Triphala churna as per standard process",
      "Weigh Shuddha Guggulu and Triphala churna in equal proportions; add Pippali",
      "Melt Guggulu gently (40–50°C); incorporate powders in small portions",
      "Triturate (Bhavana) until homogenous mass forms",
      "Roll into pills of 250–500 mg each",
      "Dry at room temperature — prevent cracks",
      "Visual inspection: uniform shape, no cracks, glossy surface",
      "Coat lightly with beeswax if required; fill in glass containers",
    ],
    qc: ["Weight variation <±5%", "Hardness 2–4 kg/cm²", "Friability <1%", "Disintegration <30 min", "Guggulsterone — HPLC", "Microbial <10⁵ CFU/g"],
    ipc: "Weight uniformity check every 100 pills; Guggulu shodhana purity check",
    dosha: "Vata-Kapha reducing; anti-inflammatory",
  },
  {
    id: 10, name: "Marichyadi Taila", sanskrit: "मरिच्यादि तैल", type: "Taila",
    form: "Medicated oil (external use)", ref: "Charaka Samhita; AFI", use: "Skin diseases, psoriasis, scabies, fungal infections",
    shelf: "3 years",
    rm: [
      { name: "Maricha / Black pepper (Piper nigrum)", cat: "herb", qty: "As per formula", part: "Fruit" },
      { name: "Nimba / Neem (Azadirachta indica)", cat: "herb", qty: "As per formula", part: "Leaf / bark" },
      { name: "Haridra (Curcuma longa)", cat: "herb", qty: "As per formula", part: "Rhizome" },
      { name: "Sesame oil (Til Taila)", cat: "base", qty: "Base oil", part: "Cold-pressed" },
    ],
    steps: [
      "Prepare Kasaya from herbs + water (16× ratio); reduce to 1/4; filter",
      "Prepare Kalka (fine paste) from key herbs",
      "Combine sesame oil + kasaya + kalka in SS vessel",
      "Heat on medium flame, stir continuously until water evaporates",
      "Perform Varti test to confirm Taila Paka endpoint",
      "Filter through multilayer muslin while hot",
      "Cool and assess clarity, aroma, colour",
      "Fill in amber glass bottles; label for external use only",
    ],
    qc: ["Sp. gravity 0.900–0.920", "Acid value <5", "Rancidity: neg", "Colour: dark yellow to brown", "Iodine value 103–112", "Moisture: nil"],
    ipc: "Paka Lakshana; Varti test; aroma check",
    dosha: "Kapha-Pitta balancing",
  },
  {
    id: 11, name: "Abhraka Bhasma", sanskrit: "अभ्रक भस्म", type: "Bhasma",
    form: "Ultra-fine calcined mineral (Rasausadhi)", ref: "Rasa Tarangini; AFI Vol.III", use: "Respiratory diseases, diabetes, anemia, cardiac weakness, Rasayana",
    shelf: "Indefinite",
    rm: [
      { name: "Abhraka (Mica / Biotite) — Shuddha", cat: "mineral", qty: "Per batch", part: "Purified mica flakes" },
      { name: "Triphala Kwatha", cat: "herb", qty: "For Shodhana", part: "Decoction" },
      { name: "Kumari swarasa (Aloe vera juice)", cat: "herb", qty: "For Bhavana", part: "Fresh leaf juice" },
      { name: "Cow dung cakes (Gobar Upla)", cat: "animal", qty: "For Puta", part: "For Gajaputa firing" },
      { name: "Cow ghee (Ghrita)", cat: "animal", qty: "For quenching", part: "Used in Nirvapana" },
    ],
    steps: [
      "Shodhana: heat mica to red-hot; quench in Triphala decoction 7–21 times",
      "Dry purified mica flakes completely",
      "Bhavana: triturate mica in Aloe vera juice for 12 hours; form thin cakes; dry",
      "Marana: place cakes in Sharava (crucible); seal; fire in Gajaputa",
      "Cool fully before opening (minimum 12 hours)",
      "Check colour (grey-black); collect powder",
      "Repeat Bhavana + Marana for 7–100 puta cycles",
      "Final QC: Bhasma Pariksha tests",
      "Store in airtight glass container away from moisture",
    ],
    qc: ["Rekhapurnata (fills finger lines)", "Varitaratwa (floats on water)", "Apunarbhava (no reversion)", "Nishchandratwa (no metallic sheen)", "XRF: Mg/Fe/Al profile", "Heavy metals: As <3ppm, Pb <10ppm", "Particle size <1μm"],
    ipc: "Puta cycle count documentation; colour/texture check after each cycle; Bhasma Pariksha at final stage",
    dosha: "Tridoshic; respiratory affinity",
  },
  {
    id: 12, name: "Kumaryasava", sanskrit: "कुमार्यासव", type: "Arishta/Asava",
    form: "Fermented herbal liquid (Asava)", ref: "AFI Vol.I; Bhaishajya Ratnavali", use: "Liver disorders, digestive weakness, jaundice, anemia",
    shelf: "Indefinite",
    rm: [
      { name: "Kumari / Aloe vera (Aloe barbadensis)", cat: "herb", qty: "Fresh juice — main", part: "Fresh leaf juice" },
      { name: "Jaggery (Guda)", cat: "base", qty: "Per formula", part: "Fermentation substrate" },
      { name: "Dhataki Pushpa (Woodfordia fruticosa)", cat: "process", qty: "Standard qty", part: "Fermentation initiator" },
      { name: "Haritaki (Terminalia chebula)", cat: "herb", qty: "As per formula", part: "Fruit" },
      { name: "Amalaki (Emblica officinalis)", cat: "herb", qty: "As per formula", part: "Fruit" },
      { name: "Trikatu (Ginger, Pepper, Long pepper)", cat: "herb", qty: "As per formula", part: "Mixed" },
    ],
    steps: [
      "Extract fresh Kumari Swarasa: wash, peel, express gel+juice; filter",
      "Transfer to fumigated fermentation vessel",
      "Add jaggery, Dhataki Pushpa, herb powders",
      "Seal vessel with 7-layer clay cloth",
      "Ferment at 25–30°C for 30 days; monitor daily",
      "Test completion: clear, aromatic, candle test positive",
      "Drain and filter through muslin and 5μ filter",
      "Measure alcohol (5–10%), pH 3.5–4.5, total solids",
      "Settle 3 days; fill in glass bottles under nitrogen; QC release",
    ],
    qc: ["Alcohol 5–10% v/v", "pH 3.5–4.5", "Clear brownish-yellow liquid", "Aloin NLT 1% (HPTLC)", "Total solids ≥4% w/v", "Microbial <10⁴ CFU/ml"],
    ipc: "Swarasa freshness (use within 4 hours); daily fermentation log",
    dosha: "Pitta-Kapha balancing; liver tonic",
  },
];

const LEGEND_ITEMS: { cat: RMCategory; label: string }[] = [
  { cat: "herb", label: "Herb (Kasthausadhi)" },
  { cat: "extract", label: "Extract" },
  { cat: "mineral", label: "Metal/Mineral (Rasausadhi)" },
  { cat: "animal", label: "Animal by-product" },
  { cat: "base", label: "Base/Excipient" },
  { cat: "process", label: "Fermentation/Process agent" },
];

const FormulationDetail = ({ f }: { f: Formulation }) => {
  const rmByGroup: Record<string, RMItem[]> = {};
  f.rm.forEach((r) => {
    if (!rmByGroup[r.cat]) rmByGroup[r.cat] = [];
    rmByGroup[r.cat].push(r);
  });

  return (
    <div className="px-5 py-4 bg-secondary border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        {/* Raw materials */}
        <div>
          <div className="section-divider">Raw materials ({f.rm.length} ingredients)</div>
          {Object.entries(rmByGroup).map(([cat, items]) => (
            <div key={cat} className="mb-2">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                {CAT_LABELS[cat] || cat}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((r, i) => (
                  <span key={i} className={`app-badge ${CAT_BADGE[r.cat as RMCategory] || "app-badge-gray"}`}>
                    {r.name.split("(")[0].trim()}
                    <span className="opacity-60 ml-1">{r.qty}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Manufacturing steps */}
        <div>
          <div className="section-divider">Manufacturing steps</div>
          <ol className="space-y-1.5">
            {f.steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="step-num step-num-current shrink-0 text-[9px] w-4 h-4">{i + 1}</span>
                <span className="text-foreground leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* QC Parameters */}
      <div className="section-divider">QC / pharmacopoeial parameters</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {f.qc.map((q, i) => (
          <span key={i} className="app-badge app-badge-gray">{q}</span>
        ))}
      </div>

      {/* IPC + Dosha */}
      <div className="flex flex-wrap gap-6">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">IPC checks</span>
          <div className="text-xs mt-1">{f.ipc}</div>
        </div>
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dosha action</span>
          <div className="text-xs mt-1">{f.dosha}</div>
        </div>
      </div>
    </div>
  );
};

const MFRTable = () => {
  const navigate = useNavigate();
  const { formulations: customFormulations } = useFormulations();
  const [filter, setFilter] = useState("All");
  const [expandedIds, setExpandedIds] = useState<Set<number | string>>(new Set());
  const [search, setSearch] = useState("");

  // Merge reference data with custom formulations
  const customAsLegacy = customFormulations.map((cf): Formulation => ({
    id: cf.id as any,
    name: cf.name,
    sanskrit: cf.sanskrit,
    type: cf.type,
    form: cf.form,
    ref: cf.ref,
    use: cf.use,
    shelf: cf.shelf,
    rm: cf.rm.map((r) => ({ name: r.name, cat: r.cat, qty: `${r.qty} ${r.unit}`, part: r.part })),
    steps: cf.steps.map((s) => s.step),
    qc: cf.qc.map((q) => `${q.parameter} ${q.spec}`),
    ipc: cf.ipc,
    dosha: cf.dosha,
    _custom: true,
    _customId: cf.id,
    _stdBatch: `${cf.standardBatchSize} ${cf.standardBatchUnit}`,
  })) as any[];

  const allData = [...customAsLegacy, ...data];

  const filtered = allData.filter((f: any) => {
    const matchType = filter === "All" || f.type === filter;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.sanskrit.includes(search);
    return matchType && matchSearch;
  });

  const toggle = (id: number | string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Manufacturing Reference Table</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {allData.length} formulations ({customFormulations.length} custom) · Ingredients · Manufacturing steps · QC parameters
          </div>
        </div>
        <button onClick={() => navigate("/bmr-create")} className="px-3.5 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1">
          <FileText className="w-3 h-3" /> Create BMR
        </button>
        <button onClick={() => navigate("/mfr-create")} className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1">
          <Plus className="w-3 h-3" /> New formulation
        </button>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 pr-2.5 py-1 border border-border rounded-md bg-secondary text-foreground text-xs w-40"
          />
        </div>
      </div>

      {/* Filter chips + Legend */}
      <div className="px-5 py-2.5 border-b border-border bg-secondary flex flex-wrap items-center gap-4">
        <div className="flex gap-1.5 items-center">
          <span className="text-[11px] text-muted-foreground">Filter:</span>
          {dosageForms.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`filter-chip ${filter === c ? "filter-chip-active" : ""}`}
            >
              {c === "Arishta/Asava" ? "Arishta / Asava" : c === "Vati/Gutika" ? "Vati / Gutika" : c}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center ml-auto">
          {LEGEND_ITEMS.map((l) => (
            <div key={l.cat} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full app-badge ${CAT_BADGE[l.cat]}`} style={{ padding: 0, width: 8, height: 8, minWidth: 8 }} />
              <span className="text-[10px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="app-card mx-5 my-4">
          <div className="overflow-x-auto">
            <table className="app-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Formulation</th>
                  <th>Category</th>
                  <th>Dosage form</th>
                  <th>Key herbs (RM)</th>
                  <th>Pharmacopoeial ref</th>
                  <th>Therapeutic use</th>
                  <th>Shelf life</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const isOpen = expandedIds.has(f.id);
                  const keyHerbs =
                    f.rm
                      .slice(0, 3)
                      .map((r) => r.name.split("(")[0].trim())
                      .join(", ") + (f.rm.length > 3 ? `, +${f.rm.length - 3} more` : "");

                  return (
                    <>
                      <tr
                        key={f.id}
                        className="cursor-pointer"
                        onClick={() => toggle(f.id)}
                      >
                        <td>
                          <ChevronRight
                            className={`w-3 h-3 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
                          />
                        </td>
                        <td>
                          <div className="font-medium">{f.name}</div>
                          <div className="text-[10px] text-muted-foreground italic">{f.sanskrit}</div>
                        </td>
                        <td>
                          <span className={`app-badge ${TYPE_BADGE[f.type] || "app-badge-gray"}`}>{f.type}</span>
                        </td>
                        <td className="text-[11px] text-muted-foreground">{f.form}</td>
                        <td className="text-[11px] max-w-[200px]">{keyHerbs}</td>
                        <td className="text-[11px] text-muted-foreground">{f.ref}</td>
                        <td className="text-[11px] max-w-[180px]">{f.use}</td>
                        <td className="text-[11px] text-muted-foreground whitespace-nowrap">{f.shelf}</td>
                      </tr>
                      {isOpen && (
                        <tr key={`detail-${f.id}`}>
                          <td colSpan={8} className="!p-0">
                            <FormulationDetail f={f} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default MFRTable;
