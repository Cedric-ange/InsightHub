"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, StatCard } from "@/components/ui";
import {
  CLUSTER_LABELS,
  FACTBOOK,
  aggregateClusters,
  formatCount,
  formatPercent,
  formatUsd,
  formatUsdBn,
  type ClusterAggregate,
  type ClusterLevel,
} from "@/lib/factbook";
import { cn } from "@/lib/utils";

const LEVELS: { value: ClusterLevel; label: string }[] = [
  { value: "main", label: "Global (NG vs RoSSA)" },
  { value: "sub", label: "Détaillé (NG vs WA vs EESA)" },
];

function ClusterBars({
  title,
  data,
  valueOf,
  formatValue,
}: {
  title: string;
  data: ClusterAggregate[];
  valueOf: (item: ClusterAggregate) => number;
  formatValue: (value: number) => string;
}) {
  const rows = data.map((item) => ({
    cluster: item.cluster,
    color: item.color,
    value: valueOf(item),
  }));

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={rows} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="cluster" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            labelFormatter={(cluster: string) => CLUSTER_LABELS[cluster as ClusterAggregate["cluster"]]}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="value" position="top" fontSize={11} formatter={formatValue} />
            {rows.map((row) => (
              <Cell key={row.cluster} fill={row.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClusterDashboard({
  level,
  onLevelChange,
}: {
  level: ClusterLevel;
  onLevelChange: (level: ClusterLevel) => void;
}) {
  const aggregates = aggregateClusters(level);
  const [ssa] = aggregates;
  const clusters = aggregates.slice(1);

  // Classement PIB/hab. (en milliers de USD) sur l'ensemble des marchés.
  const perCapita = [...FACTBOOK]
    .filter((row) => typeof row.gdpPerCapitaUsd === "number")
    .sort((a, b) => (b.gdpPerCapitaUsd ?? 0) - (a.gdpPerCapitaUsd ?? 0))
    .map((row) => ({
      country: row.country,
      value: (row.gdpPerCapitaUsd ?? 0) / 1000,
      color: clusters.find((item) => item.cluster === (level === "main" ? row.mainCluster : row.subCluster))?.color,
    }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="max-w-3xl text-sm leading-relaxed text-brand-700">
            <span className="font-semibold">{formatCount(Math.round(ssa.population / 1e6))} M</span> de
            consommateurs à nourrir en Afrique subsaharienne, dont{" "}
            <span className="font-semibold">{formatPercent(ssa.urbanRate, 0)}</span> en zone urbaine. Population
            jeune : <span className="font-semibold">{formatPercent(ssa.youthRate, 0)}</span> ont moins de 14 ans.
            La pauvreté reste un enjeu majeur —{" "}
            <span className="font-semibold">{formatPercent(ssa.povertyRate, 0)}</span> vivent sous le seuil de
            pauvreté. PIB estimé : <span className="font-semibold">{formatUsdBn(ssa.gdpUsdBn)}</span>.
          </p>
          <div className="flex rounded-lg border border-slate-200 p-0.5">
            {LEVELS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onLevelChange(item.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium",
                  level === item.value ? "bg-brand-500 text-white" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {clusters.map((item) => (
          <StatCard
            key={item.cluster}
            label={item.label}
            value={`${formatCount(Math.round(item.population / 1e6))} M`}
            hint={`${item.countries} pays · ${formatPercent(item.populationShare, 0)} de la population SSA · ${formatUsdBn(item.gdpUsdBn)}`}
            tone={item.cluster === "NG" ? "brand" : "green"}
          />
        ))}
        <StatCard
          label="PIB / habitant SSA"
          value={formatUsd(Math.round(ssa.gdpPerCapitaUsd))}
          hint={`${ssa.countries} marchés · ${formatUsdBn(ssa.gdpUsdBn)}`}
          tone="slate"
        />
      </div>

      <Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <ClusterBars
            title="Population (millions)"
            data={aggregates}
            valueOf={(item) => Math.round(item.population / 1e6)}
            formatValue={(value) => formatCount(value)}
          />

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contribution régionale
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={clusters}
                  dataKey="population"
                  nameKey="cluster"
                  innerRadius={40}
                  outerRadius={70}
                  label={(entry: { populationShare: number }) => formatPercent(entry.populationShare, 0)}
                  labelLine={false}
                >
                  {clusters.map((item) => (
                    <Cell key={item.cluster} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCount(value)}
                  labelFormatter={(cluster: string) => CLUSTER_LABELS[cluster as ClusterAggregate["cluster"]]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ClusterBars
            title="Population de moins de 14 ans"
            data={aggregates}
            valueOf={(item) => Math.round(item.youthRate * 100)}
            formatValue={(value) => `${value} %`}
          />
          <ClusterBars
            title="Taux d'urbanisation"
            data={aggregates}
            valueOf={(item) => Math.round(item.urbanRate * 100)}
            formatValue={(value) => `${value} %`}
          />
          <ClusterBars
            title="Sous le seuil de pauvreté"
            data={aggregates}
            valueOf={(item) => Math.round(item.povertyRate * 100)}
            formatValue={(value) => `${value} %`}
          />
          <ClusterBars
            title="PIB (milliards USD)"
            data={aggregates}
            valueOf={(item) => Math.round(item.gdpUsdBn)}
            formatValue={(value) => formatCount(value)}
          />
        </div>
      </Card>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          PIB par habitant (milliers USD, 2024 est.)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={perCapita} margin={{ top: 18, right: 8, left: 0, bottom: 60 }}>
            <XAxis dataKey="country" angle={-45} textAnchor="end" interval={0} fontSize={10} height={60} />
            <YAxis fontSize={11} tickFormatter={(value: number) => `${value}`} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)} k$`} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {perCapita.map((row) => (
                <Cell key={row.country} fill={row.color ?? "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
