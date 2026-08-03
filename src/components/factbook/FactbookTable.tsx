"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import {
  FACTBOOK,
  formatCount,
  formatPercent,
  type FactbookCountry,
} from "@/lib/factbook";
import { cn } from "@/lib/utils";

type SortKey = "country" | "population" | "populationGrowth" | "urbanRate" | "inflationRate" | "internetPenetration";

const COLUMNS: { key: SortKey; label: string; render: (row: FactbookCountry) => string; align?: string }[] = [
  { key: "country", label: "Pays", render: (row) => row.country },
  { key: "population", label: "Population", render: (row) => formatCount(row.population), align: "text-right" },
  { key: "populationGrowth", label: "Croissance", render: (row) => formatPercent(row.populationGrowth), align: "text-right" },
  { key: "urbanRate", label: "Urbanisation", render: (row) => formatPercent(row.urbanRate), align: "text-right" },
  { key: "inflationRate", label: "Inflation", render: (row) => formatPercent(row.inflationRate), align: "text-right" },
  { key: "internetPenetration", label: "Internet", render: (row) => formatPercent(row.internetPenetration), align: "text-right" },
];

export function FactbookTable({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (iso3: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("population");
  const [descending, setDescending] = useState(true);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? FACTBOOK.filter((row) => row.country.toLowerCase().includes(needle))
      : FACTBOOK;
    return [...filtered].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === "string" || typeof right === "string") {
        return String(left).localeCompare(String(right), "fr") * (descending ? -1 : 1);
      }
      // Les pays sans donnée restent en fin de tri quel que soit le sens.
      if (left === null) return 1;
      if (right === null) return -1;
      return (left - right) * (descending ? -1 : 1);
    });
  }, [query, sortKey, descending]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDescending((value) => !value);
      return;
    }
    setSortKey(key);
    setDescending(key !== "country");
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
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
        <span className="text-xs text-slate-400">{rows.length} pays</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              {COLUMNS.map((column) => (
                <th key={column.key} className={cn("py-2 font-medium", column.align ?? "text-left")}>
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
                      "py-2 text-slate-700",
                      column.align ?? "text-left",
                      column.key === "country" && "font-medium text-slate-900",
                    )}
                  >
                    {column.render(row)}
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
