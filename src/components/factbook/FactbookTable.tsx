"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, Search } from "lucide-react";
import {
  CLUSTER_LABELS,
  FACTBOOK,
  formatCount,
  formatPercent,
  formatText,
  formatUsd,
  formatUsdBn,
  type ClusterKey,
  type FactbookCountry,
} from "@/lib/factbook";
import { downloadFactbookExcel } from "@/lib/factbookExport";
import { cn } from "@/lib/utils";

type Column = {
  key: keyof FactbookCountry;
  label: string;
  render: (row: FactbookCountry) => string;
  numeric?: boolean;
  wide?: boolean;
};

// Toutes les variables du classeur Excel, dans l'ordre du Factbook.
const COLUMNS: Column[] = [
  { key: "country", label: "Pays", render: (row) => row.country },
  { key: "mainCluster", label: "Cluster", render: (row) => row.mainCluster },
  { key: "subCluster", label: "Sous-cluster", render: (row) => row.subCluster },
  { key: "areaKm2", label: "Superficie (km²)", render: (row) => formatCount(row.areaKm2), numeric: true },
  { key: "population", label: "Population 2025", render: (row) => formatCount(row.population), numeric: true },
  { key: "populationGrowth", label: "Croissance pop.", render: (row) => formatPercent(row.populationGrowth), numeric: true },
  { key: "age0_14", label: "0-14 ans", render: (row) => formatPercent(row.age0_14), numeric: true },
  { key: "age15_64", label: "15-64 ans", render: (row) => formatPercent(row.age15_64), numeric: true },
  { key: "age65plus", label: "65 ans et +", render: (row) => formatPercent(row.age65plus), numeric: true },
  { key: "medianAge", label: "Âge médian", render: (row) => formatText(row.medianAge) },
  { key: "urbanRate", label: "Urbanisation", render: (row) => formatPercent(row.urbanRate), numeric: true },
  { key: "urbanPopulation", label: "Population urbaine", render: (row) => formatCount(row.urbanPopulation), numeric: true },
  { key: "population0_14", label: "Population < 14 ans", render: (row) => formatCount(row.population0_14), numeric: true },
  { key: "literacyTotal", label: "Alphabétisation", render: (row) => formatPercent(row.literacyTotal), numeric: true },
  { key: "literacyMale", label: "Alphab. hommes", render: (row) => formatPercent(row.literacyMale), numeric: true },
  { key: "literacyFemale", label: "Alphab. femmes", render: (row) => formatPercent(row.literacyFemale), numeric: true },
  { key: "gdpUsdBn", label: "PIB (Md $)", render: (row) => formatUsdBn(row.gdpUsdBn), numeric: true },
  { key: "gdpGrowth", label: "Croissance PIB", render: (row) => formatPercent(row.gdpGrowth), numeric: true },
  { key: "gdpPerCapitaUsd", label: "PIB / hab.", render: (row) => formatUsd(row.gdpPerCapitaUsd), numeric: true },
  { key: "unemploymentRate", label: "Chômage", render: (row) => formatPercent(row.unemploymentRate), numeric: true },
  { key: "povertyRate", label: "Sous seuil pauvreté", render: (row) => formatPercent(row.povertyRate), numeric: true },
  { key: "populationBelowPoverty", label: "Pop. sous seuil", render: (row) => formatCount(row.populationBelowPoverty), numeric: true },
  { key: "inflationRate", label: "Inflation", render: (row) => formatPercent(row.inflationRate), numeric: true },
  { key: "mobileUsers", label: "Abonnés mobile", render: (row) => formatCount(row.mobileUsers), numeric: true },
  { key: "mobilePenetration", label: "Pénétration mobile", render: (row) => formatPercent(row.mobilePenetration), numeric: true },
  { key: "internetUsers", label: "Internautes", render: (row) => formatCount(row.internetUsers), numeric: true },
  { key: "internetPenetration", label: "Pénétration internet", render: (row) => formatPercent(row.internetPenetration), numeric: true },
  { key: "radioStations", label: "Radios", render: (row) => formatCount(row.radioStations), numeric: true },
  { key: "tvStations", label: "Chaînes TV", render: (row) => formatCount(row.tvStations), numeric: true },
  { key: "adminDivision", label: "Découpage admin.", render: (row) => formatText(row.adminDivision) },
  { key: "languages", label: "Langues", render: (row) => formatText(row.languages), wide: true },
  { key: "ethnicGroups", label: "Groupes ethniques", render: (row) => formatText(row.ethnicGroups), wide: true },
  { key: "religions", label: "Religions", render: (row) => formatText(row.religions), wide: true },
  { key: "incomeShare", label: "Répartition des revenus", render: (row) => formatText(row.incomeShare), wide: true },
];

const FILTERS: { value: "ALL" | ClusterKey; label: string }[] = [
  { value: "ALL", label: "Tous les pays SSA" },
  { value: "NG", label: CLUSTER_LABELS.NG },
  { value: "RoSSA", label: CLUSTER_LABELS.RoSSA },
  { value: "WA", label: CLUSTER_LABELS.WA },
  { value: "EESA", label: CLUSTER_LABELS.EESA },
];

export function FactbookTable({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso3: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | ClusterKey>("ALL");
  const [sortKey, setSortKey] = useState<keyof FactbookCountry>("population");
  const [descending, setDescending] = useState(true);
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = FACTBOOK.filter((row) => {
      if (needle && !row.country.toLowerCase().includes(needle)) return false;
      if (filter === "ALL") return true;
      if (filter === "NG" || filter === "RoSSA") return row.mainCluster === filter;
      return row.subCluster === filter;
    });
    return [...filtered].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === "string" || typeof right === "string") {
        return String(left).localeCompare(String(right), "fr") * (descending ? -1 : 1);
      }
      // Les pays sans donnée restent en fin de tri quel que soit le sens.
      if (left === null) return 1;
      if (right === null) return -1;
      return ((left as number) - (right as number)) * (descending ? -1 : 1);
    });
  }, [query, filter, sortKey, descending]);

  const toggleSort = (key: keyof FactbookCountry) => {
    if (key === sortKey) {
      setDescending((value) => !value);
      return;
    }
    setSortKey(key);
    setDescending(key !== "country");
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un pays…"
            className="pl-9"
            aria-label="Rechercher un pays"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as "ALL" | ClusterKey)}
          className="max-w-[320px]"
          aria-label="Filtrer par cluster"
        >
          {FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">
          {rows.length} pays · {COLUMNS.length} variables
        </span>
        <button
          type="button"
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              // Export de la sélection courante (recherche + filtre cluster).
              await downloadFactbookExcel(rows);
            } finally {
              setExporting(false);
            }
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Export en cours…" : "Exporter en Excel"}
        </button>
      </div>

      <div className="max-h-[560px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "whitespace-nowrap px-2 py-2 font-medium",
                    column.numeric ? "text-right" : "text-left",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-slate-700",
                      sortKey === column.key && "text-brand-600",
                    )}
                  >
                    {column.label}
                    {sortKey === column.key &&
                      (descending ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.iso3}
                onClick={() => onSelect(row.iso3)}
                className={cn(
                  "cursor-pointer border-b border-slate-100 hover:bg-slate-50",
                  row.iso3 === selected && "bg-brand-50 hover:bg-brand-50",
                )}
              >
                {COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-2 py-2 text-slate-700",
                      column.numeric ? "whitespace-nowrap text-right" : "text-left",
                      column.wide && "text-xs",
                      column.key === "country" && "whitespace-nowrap font-medium text-slate-900",
                    )}
                    title={column.wide ? column.render(row) : undefined}
                  >
                    {column.wide ? (
                      // Texte long tronqué sur une ligne, contenu complet en infobulle.
                      <div className="w-[240px] truncate">{column.render(row)}</div>
                    ) : (
                      column.render(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
