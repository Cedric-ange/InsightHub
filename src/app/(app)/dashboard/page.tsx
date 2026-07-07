"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  MapPin,
  Tags,
  LayoutGrid,
  Smile,
  Gauge,
} from "lucide-react";
import { getDB } from "@/lib/db";
import {
  computeKPIs,
  interviewsTrend,
  priceByBrand,
  shelfShareByBrand,
} from "@/lib/analytics";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { formatFCFA } from "@/lib/utils";
import { GpsMap } from "@/components/GpsMap";

const PIE = ["#D32F2F", "#009639", "#FBC02D", "#0ea5a4", "#8b5cf6"];

export default function DashboardPage() {
  const data = useLiveQuery(async () => {
    const db = getDB();
    const [submissions, price, merch] = await Promise.all([
      db.submissions.toArray(),
      db.priceAudits.toArray(),
      db.merchAudits.toArray(),
    ]);
    return { submissions, price, merch };
  }, []);

  if (!data) {
    return <p className="text-slate-400">Chargement des données…</p>;
  }

  const kpis = computeKPIs(data.submissions, data.price, data.merch);
  const trend = interviewsTrend(data.submissions);
  const brands = priceByBrand(data.price);
  const shelf = shelfShareByBrand(data.merch);
  const geoPoints = data.submissions
    .filter((s) => s.geo)
    .map((s) => s.geo!)
    .slice(0, 100);

  return (
    <div>
      <PageHeader
        title="Dashboard Direction"
        subtitle="Vue temps réel de la performance marché, concurrence et consommateur."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Interviews"
          value={kpis.interviews}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Régions couvertes"
          value={kpis.regionsCovered}
          icon={<MapPin size={18} />}
          tone="green"
        />
        <StatCard
          label="Prix moyen"
          value={formatFCFA(kpis.avgOwnPrice)}
          hint={`Indice ${Math.round(kpis.priceIndex)}`}
          icon={<Tags size={18} />}
          tone="amber"
        />
        <StatCard
          label="Part de linéaire"
          value={`${Math.round(kpis.shareOfShelf * 100)}%`}
          icon={<LayoutGrid size={18} />}
          tone="brand"
        />
        <StatCard
          label="Disponibilité"
          value={`${Math.round(kpis.availabilityRate * 100)}%`}
          icon={<Gauge size={18} />}
          tone={kpis.availabilityRate < 0.8 ? "red" : "green"}
        />
        <StatCard
          label="Satisfaction"
          value={`${Math.round(kpis.satisfaction * 100)}%`}
          icon={<Smile size={18} />}
          tone="green"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Interviews par jour (14 j)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="interviews"
                stroke="#D32F2F"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Prix moyen par marque (FCFA)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={brands}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatFCFA(v)} />
              <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]}>
                {brands.map((b, i) => (
                  <Cell key={i} fill={b.isOwn ? "#D32F2F" : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Part de linéaire par marque
          </h3>
          <div className="space-y-3">
            {shelf.map((s, i) => (
              <div key={s.brand}>
                <div className="mb-1 flex justify-between text-xs text-slate-600">
                  <span>{s.brand}</span>
                  <span className="font-semibold">
                    {Math.round(s.share * 100)}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.round(s.share * 100)}%`,
                      backgroundColor: PIE[i % PIE.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Cartographie des enquêtes (GPS)
          </h3>
          <GpsMap points={geoPoints} height={240} />
        </Card>
      </div>
    </div>
  );
}
