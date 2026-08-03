import factbookData from "@/data/factbook.json";
import africaMapData from "@/data/africa-map.json";

// Données CIA World Factbook (FMCG 2026) — générées par scripts/build_factbook.py.
// Les taux sont des fractions (0..1), les volumes des nombres absolus.
// NG = Nigeria, RoSSA = reste de l'Afrique subsaharienne (les 41 autres marchés).
export type MainCluster = "NG" | "RoSSA";
// Sous-découpage régional : WA = Afrique de l'Ouest hors Nigeria,
// EESA = Afrique de l'Est, Centrale et Australe.
export type SubCluster = "NG" | "WA" | "EESA";
export type ClusterKey = "SSA" | MainCluster | SubCluster;
export type ClusterLevel = "main" | "sub";

export interface FactbookCountry {
  iso3: string;
  mainCluster: MainCluster;
  subCluster: SubCluster;
  country: string;
  areaKm2: number | null;
  population: number | null;
  populationGrowth: number | null;
  age0_14: number | null;
  age15_64: number | null;
  age65plus: number | null;
  medianAge: string | null;
  urbanRate: number | null;
  ethnicGroups: string | null;
  religions: string | null;
  languages: string | null;
  literacyTotal: number | null;
  literacyMale: number | null;
  literacyFemale: number | null;
  adminDivision: string | null;
  gdp: string | null;
  gdpGrowth: number | null;
  gdpPerCapita: string | null;
  unemploymentRate: number | null;
  povertyRate: number | null;
  incomeShare: string | null;
  inflationRate: number | null;
  mobileUsers: number | null;
  mobilePenetration: number | null;
  internetUsers: number | null;
  internetPenetration: number | null;
  radioStations: number | null;
  tvStations: number | null;
  urbanPopulation: number | null;
  population0_14: number | null;
  populationBelowPoverty: number | null;
  gdpUsdBn: number | null;
  gdpPerCapitaUsd: number | null;
}

export interface CountryShape {
  iso3: string;
  name: string;
  d: string;
}

export interface AfricaMap {
  width: number;
  height: number;
  countries: CountryShape[];
}

export const FACTBOOK: FactbookCountry[] = factbookData as FactbookCountry[];
export const AFRICA_MAP: AfricaMap = africaMapData as AfricaMap;

export type NumericKey = {
  [K in keyof FactbookCountry]: FactbookCountry[K] extends number | null ? K : never;
}[keyof FactbookCountry];

export type IndicatorFormat = "percent" | "count";

export interface Indicator {
  key: NumericKey;
  label: string;
  format: IndicatorFormat;
  hint: string;
}

// Indicateurs cartographiables (reprend la logique du prototype Streamlit).
export const INDICATORS: Indicator[] = [
  { key: "population", label: "Population (2025)", format: "count", hint: "Taille du marché consommateur" },
  { key: "populationGrowth", label: "Croissance démographique", format: "percent", hint: "Potentiel de volume futur" },
  { key: "urbanRate", label: "Taux d'urbanisation", format: "percent", hint: "Densité du retail moderne" },
  { key: "gdpGrowth", label: "Croissance du PIB", format: "percent", hint: "Dynamique économique" },
  { key: "inflationRate", label: "Inflation", format: "percent", hint: "Pression sur le pouvoir d'achat" },
  { key: "povertyRate", label: "Population sous le seuil de pauvreté", format: "percent", hint: "Sensibilité prix" },
  { key: "literacyTotal", label: "Alphabétisation", format: "percent", hint: "Lisibilité packaging & PLV" },
  { key: "internetPenetration", label: "Pénétration internet", format: "percent", hint: "Activation digitale" },
  { key: "mobilePenetration", label: "Pénétration mobile", format: "percent", hint: "Mobile money & SMS" },
  { key: "age0_14", label: "Population 0-14 ans", format: "percent", hint: "Cible nutrition infantile" },
];

// Palette séquentielle alignée sur la charte (bleu FrieslandCampina).
export const CHOROPLETH_SCALE = [
  "#e1ecf7",
  "#b8d4ee",
  "#7fb2e0",
  "#408ece",
  "#005CA9",
  "#003c71",
];

export const NO_DATA_COLOR = "#e2e8f0";

export const CLUSTER_LABELS: Record<ClusterKey, string> = {
  SSA: "SSA (total)",
  NG: "Nigeria (NG)",
  RoSSA: "Reste de l'Afrique subsaharienne (RoSSA)",
  WA: "Afrique de l'Ouest hors NG (WA)",
  EESA: "Afrique de l'Est, Centrale & Australe (EESA)",
};

export const CLUSTER_COLORS: Record<ClusterKey, string> = {
  SSA: "#005CA9",
  NG: "#00A8FF",
  RoSSA: "#70AD47",
  WA: "#FBC02D",
  EESA: "#70AD47",
};

export interface ClusterAggregate {
  cluster: ClusterKey;
  label: string;
  color: string;
  countries: number;
  population: number;
  populationShare: number;
  urbanRate: number;
  youthRate: number;
  povertyRate: number;
  gdpUsdBn: number;
  gdpPerCapitaUsd: number;
}

function sum(rows: FactbookCountry[], key: NumericKey): number {
  return rows.reduce((total, row) => total + (row[key] ?? 0), 0);
}

function aggregate(cluster: ClusterKey, rows: FactbookCountry[], total: number): ClusterAggregate {
  const population = sum(rows, "population");
  const gdpUsdBn = sum(rows, "gdpUsdBn");
  return {
    cluster,
    label: CLUSTER_LABELS[cluster],
    color: CLUSTER_COLORS[cluster],
    countries: rows.length,
    population,
    populationShare: total > 0 ? population / total : 0,
    // Taux pondérés : on repart des volumes absolus du classeur, pas d'une
    // moyenne des pourcentages pays (qui donnerait le même poids au Cap-Vert
    // qu'au Nigeria).
    urbanRate: population > 0 ? sum(rows, "urbanPopulation") / population : 0,
    youthRate: population > 0 ? sum(rows, "population0_14") / population : 0,
    povertyRate: population > 0 ? sum(rows, "populationBelowPoverty") / population : 0,
    gdpUsdBn,
    gdpPerCapitaUsd: population > 0 ? (gdpUsdBn * 1e9) / population : 0,
  };
}

/** Agrégats SSA puis, selon le niveau, NG/RoSSA ou NG/WA/EESA. */
export function aggregateClusters(level: ClusterLevel): ClusterAggregate[] {
  const total = sum(FACTBOOK, "population");
  const keys: ClusterKey[] = level === "main" ? ["NG", "RoSSA"] : ["NG", "WA", "EESA"];
  const field = level === "main" ? "mainCluster" : "subCluster";
  return [
    aggregate("SSA", FACTBOOK, total),
    ...keys.map((key) => aggregate(key, FACTBOOK.filter((row) => row[field] === key), total)),
  ];
}

export function clusterOf(country: FactbookCountry, level: ClusterLevel): ClusterKey {
  return level === "main" ? country.mainCluster : country.subCluster;
}

export function getCountry(iso3: string): FactbookCountry | undefined {
  return FACTBOOK.find((item) => item.iso3 === iso3);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/D";
  return `${(value * 100).toFixed(digits).replace(".", ",")} %`;
}

export function formatUsdBn(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/D";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} Md $`;
}

export function formatUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/D";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} $`;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/D";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);
}

export function formatIndicator(value: number | null, format: IndicatorFormat): string {
  return format === "percent" ? formatPercent(value) : formatCount(value);
}

export function formatText(value: string | null | undefined): string {
  return value && value.trim() ? value : "N/D";
}

/**
 * Seuils par quantiles : les indicateurs FMCG (population, inflation) sont très
 * asymétriques, une échelle linéaire écraserait la lecture de la carte.
 */
export function quantileThresholds(values: number[], buckets: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) return [];
  const thresholds: number[] = [];
  for (let i = 1; i < buckets; i += 1) {
    const position = (sorted.length - 1) * (i / buckets);
    const low = Math.floor(position);
    const high = Math.ceil(position);
    thresholds.push(sorted[low] + (sorted[high] - sorted[low]) * (position - low));
  }
  return thresholds;
}

export function bucketIndex(value: number, thresholds: number[]): number {
  let index = 0;
  while (index < thresholds.length && value >= thresholds[index]) index += 1;
  return index;
}

export interface ChoroplethScale {
  colorFor: (iso3: string) => string;
  legend: { color: string; label: string }[];
}

export function buildChoroplethScale(indicator: Indicator): ChoroplethScale {
  const values = FACTBOOK.map((item) => item[indicator.key]).filter(
    (value): value is number => typeof value === "number",
  );
  const thresholds = quantileThresholds(values, CHOROPLETH_SCALE.length);
  const byIso = new Map(FACTBOOK.map((item) => [item.iso3, item[indicator.key]]));

  const bounds = [Math.min(...values), ...thresholds, Math.max(...values)];
  const legend = CHOROPLETH_SCALE.map((color, index) => ({
    color,
    label: `${formatIndicator(bounds[index], indicator.format)} – ${formatIndicator(bounds[index + 1], indicator.format)}`,
  }));

  return {
    colorFor: (iso3: string) => {
      const value = byIso.get(iso3);
      if (typeof value !== "number") return NO_DATA_COLOR;
      return CHOROPLETH_SCALE[bucketIndex(value, thresholds)];
    },
    legend,
  };
}
