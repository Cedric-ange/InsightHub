"use client";

import { useState } from "react";
import { AfricaMap } from "@/components/factbook/AfricaMap";
import { ClusterDashboard } from "@/components/factbook/ClusterDashboard";
import { CountryProfile } from "@/components/factbook/CountryProfile";
import { FactbookTable } from "@/components/factbook/FactbookTable";
import { Card, PageHeader } from "@/components/ui";
import { FACTBOOK, INDICATORS, getCountry, type ClusterLevel } from "@/lib/factbook";

const DEFAULT_ISO3 = "CIV";
// "cluster" colore la carte par groupe business, sinon par indicateur.
const MAP_MODES = [
  { value: "cluster", label: "Clusters NG / RoSSA" },
  { value: "indicator", label: "Indicateur" },
] as const;

export default function FactbookPage() {
  const [indicatorKey, setIndicatorKey] = useState(INDICATORS[0].key);
  const [selected, setSelected] = useState(DEFAULT_ISO3);
  const [level, setLevel] = useState<ClusterLevel>("main");
  const [mapMode, setMapMode] = useState<(typeof MAP_MODES)[number]["value"]>("cluster");

  const indicator = INDICATORS.find((item) => item.key === indicatorKey) ?? INDICATORS[0];
  const country = getCountry(selected) ?? FACTBOOK[0];

  return (
    <div>
      <PageHeader
        title="Factbook FMCG"
        subtitle={`${FACTBOOK.length} marchés africains — CIA World Factbook, édition FMCG 2026`}
        action={
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="max-w-[220px]"
            aria-label="Sélectionner un pays"
          >
            {[...FACTBOOK]
              .sort((a, b) => a.country.localeCompare(b.country, "fr"))
              .map((item) => (
                <option key={item.iso3} value={item.iso3}>
                  {item.country}
                </option>
              ))}
          </select>
        }
      />

      <ClusterDashboard level={level} onLevelChange={setLevel} />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Cartographie</h2>
              <p className="text-xs text-slate-500">
                {mapMode === "cluster" ? "Découpage business des marchés" : indicator.hint}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={mapMode}
                onChange={(event) => setMapMode(event.target.value as typeof mapMode)}
                className="max-w-[200px]"
                aria-label="Mode de coloration de la carte"
              >
                {MAP_MODES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {mapMode === "indicator" && (
                <select
                  value={indicator.key}
                  onChange={(event) => setIndicatorKey(event.target.value as typeof indicatorKey)}
                  className="max-w-[240px]"
                  aria-label="Indicateur cartographié"
                >
                  {INDICATORS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <AfricaMap
            indicator={indicator}
            clusterLevel={mapMode === "cluster" ? level : null}
            selected={selected}
            onSelect={setSelected}
          />
          <p className="mt-2 text-xs text-slate-400">
            Cliquez sur un pays pour afficher sa fiche détaillée.
          </p>
        </Card>

        <div className="space-y-4">
          <CountryProfile country={country} />
        </div>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Données comparées — toutes les variables du Factbook
        </h2>
        <FactbookTable selected={selected} onSelect={setSelected} />
        <p className="mt-3 text-xs text-slate-400">
          Source : CIA The World Factbook — consolidation FMCG 2026.
        </p>
      </Card>
    </div>
  );
}
