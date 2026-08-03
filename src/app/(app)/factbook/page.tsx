"use client";

import { useState } from "react";
import { AfricaMap } from "@/components/factbook/AfricaMap";
import { CountryProfile } from "@/components/factbook/CountryProfile";
import { FactbookTable } from "@/components/factbook/FactbookTable";
import { Card, PageHeader } from "@/components/ui";
import { FACTBOOK, INDICATORS, getCountry } from "@/lib/factbook";

const DEFAULT_ISO3 = "CIV";

export default function FactbookPage() {
  const [indicatorKey, setIndicatorKey] = useState(INDICATORS[0].key);
  const [selected, setSelected] = useState(DEFAULT_ISO3);

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Cartographie thématique</h2>
              <p className="text-xs text-slate-500">{indicator.hint}</p>
            </div>
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
          </div>
          <AfricaMap indicator={indicator} selected={selected} onSelect={setSelected} />
          <p className="mt-2 text-xs text-slate-400">
            Cliquez sur un pays pour afficher sa fiche détaillée.
          </p>
        </Card>

        <div className="space-y-4">
          <CountryProfile country={country} />
        </div>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Données comparées</h2>
        <FactbookTable selected={selected} onSelect={setSelected} />
        <p className="mt-3 text-xs text-slate-400">
          Source : CIA The World Factbook — consolidation FMCG 2026.
        </p>
      </Card>
    </div>
  );
}
