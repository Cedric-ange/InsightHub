"use client";

import { Globe2, LineChart, TrendingUp, Users } from "lucide-react";
import { Card, StatCard } from "@/components/ui";
import {
  formatCount,
  formatPercent,
  formatText,
  type FactbookCountry,
} from "@/lib/factbook";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-slate-700">{value}</dd>
    </div>
  );
}

export function CountryProfile({ country }: { country: FactbookCountry }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Population (2025)"
          value={formatCount(country.population)}
          hint={`Croissance ${formatPercent(country.populationGrowth)}`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="PIB / habitant"
          value={formatText(country.gdpPerCapita)}
          hint={`PIB ${formatText(country.gdp)}`}
          icon={<LineChart className="h-4 w-4" />}
          tone="green"
        />
        <StatCard
          label="Inflation"
          value={formatPercent(country.inflationRate)}
          hint={`Croissance PIB ${formatPercent(country.gdpGrowth)}`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="amber"
        />
        <StatCard
          label="Urbanisation"
          value={formatPercent(country.urbanRate)}
          hint={`${formatCount(country.urbanPopulation)} urbains`}
          icon={<Globe2 className="h-4 w-4" />}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Démographie &amp; société</h3>
          <dl>
            <Field label="Âge médian" value={formatText(country.medianAge)} />
            <Field
              label="Structure par âge"
              value={`0-14 ans : ${formatPercent(country.age0_14)} · 15-64 ans : ${formatPercent(country.age15_64)} · 65 ans et + : ${formatPercent(country.age65plus)}`}
            />
            <Field
              label="Alphabétisation"
              value={`Total ${formatPercent(country.literacyTotal)} · Hommes ${formatPercent(country.literacyMale)} · Femmes ${formatPercent(country.literacyFemale)}`}
            />
            <Field label="Langues" value={formatText(country.languages)} />
            <Field label="Groupes ethniques" value={formatText(country.ethnicGroups)} />
            <Field label="Religions" value={formatText(country.religions)} />
            <Field label="Découpage administratif" value={formatText(country.adminDivision)} />
            <Field label="Superficie" value={`${formatCount(country.areaKm2)} km²`} />
          </dl>
        </Card>

        <Card>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Économie &amp; accessibilité FMCG</h3>
          <dl>
            <Field label="PIB officiel" value={formatText(country.gdp)} />
            <Field label="Taux de chômage" value={formatPercent(country.unemploymentRate)} />
            <Field
              label="Sous le seuil de pauvreté"
              value={`${formatPercent(country.povertyRate)} · ${formatCount(country.populationBelowPoverty)} personnes`}
            />
            <Field label="Répartition des revenus" value={formatText(country.incomeShare)} />
            <Field
              label="Mobile"
              value={`${formatCount(country.mobileUsers)} abonnés · ${formatPercent(country.mobilePenetration)} de la population`}
            />
            <Field
              label="Internet"
              value={`${formatCount(country.internetUsers)} utilisateurs · ${formatPercent(country.internetPenetration)} de la population`}
            />
            <Field
              label="Médias"
              value={`${formatCount(country.radioStations)} radios · ${formatCount(country.tvStations)} chaînes TV`}
            />
            <Field
              label="Population 0-14 ans"
              value={`${formatCount(country.population0_14)} enfants`}
            />
          </dl>
        </Card>
      </div>
    </div>
  );
}
