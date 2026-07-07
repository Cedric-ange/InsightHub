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

// Palette de couleurs de marque unifiée (Bonnet Rouge, Friesland Royal Blue, Gold, Slate)
const BRAND_PALETTE = ["#D32F2F", "#005CA9", "#FBC02D", "#009639", "#64748b"];

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
    return <p className="text-slate-400 p-6">Chargement des données de terrain…</p>;
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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Direction"
        subtitle="Vue temps réel de la performance marché, concurrence et consommateur."
      />

      {/* Cartes d'indicateurs de performance (KPI Cards) */}
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
          tone="brand"
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
          tone="amber"
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
        {/* Graphique d'Évolution : Bleu Royal FrieslandCampina */}
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Interviews par jour (14 j)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Line
                type="monotone"
                dataKey="interviews"
                stroke="#005CA9"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#005CA9', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Graphique Prix par Marque : Rouge Bonnet Rouge pour notre marque */}
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Prix moyen par marque (FCFA)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={brands}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(v: number) => formatFCFA(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="avgPrice" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {brands.map((b, i) => (
                  <Cell 
                    key={i} 
                    fill={b.isOwn ? "#D32F2F" : (b.brand.toLowerCase().includes("nestlé") ? "#94a3b8" : "#cbd5e1")} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Parts de Linéaire progressives */}
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Part de linéaire par marque
          </h3>
          <div className="space-y-4">
            {shelf.map((s, i) => (
              <div key={s.brand} className="group">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600">
                  <span className="group-hover:text-slate-900 transition-colors">{s.brand}</span>
                  <span className="font-bold text-slate-900">
                    {Math.round(s.share * 100)}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(s.share * 100)}%`,
                      backgroundColor: BRAND_PALETTE[i % BRAND_PALETTE.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cartographie de Terrain */}
        <Card>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
            Cartographie des enquêtes (GPS)
          </h3>
          <div className="rounded-xl overflow-hidden border border-slate-100 shadow-inner">
            <GpsMap points={geoPoints} height={240} />
          </div>
        </Card>
      </div>
    </div>
  );
}