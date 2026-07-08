"use client";

import { useState } from "react";
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
  ClipboardList,
  BarChart3,
  Globe,
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
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const data = useLiveQuery(async () => {
    const db = getDB();
    const [submissions, price, merch] = await Promise.all([
      db.submissions.toArray(),
      db.priceAudits.toArray(),
      db.merchAudits.toArray(),
    ]);

    // Nettoyage et harmonisation de la marque locale
    const cleanedPrice = price.map(p => ({
      ...p,
      brand: p.brand === "Notre marque" ? "Bonnet Rouge" : p.brand
    }));

    const cleanedMerch = merch.map(m => ({
      ...m,
      brand: m.brand === "Notre marque" ? "Bonnet Rouge" : m.brand
    }));

    return { submissions, price: cleanedPrice, merch: cleanedMerch };
  }, []);

  if (!data) {
    return <p className="text-slate-400">Chargement des analyses de performance...</p>;
  }

  // 🎛️ FILTRAGE DYNAMIQUE DES DONNÉES SELON LA SIDEBAR SECONDAIRE
  const filteredPrice = selectedModule === "all" || selectedModule === "price" ? data.price : [];
  const filteredMerch = selectedModule === "all" || selectedModule === "merch" ? data.merch : [];
  const filteredSubmissions = selectedModule === "all" 
    ? data.submissions 
    : selectedModule === "facebook" 
    ? data.submissions.filter(s => s.studyId === "guide_consumer")
    : data.submissions.filter(s => s.studyId=== selectedModule);

  // Recalcul des métriques à la volée
  const kpis = computeKPIs(filteredSubmissions, filteredPrice, filteredMerch);
  const trend = interviewsTrend(filteredSubmissions);
  const brands = priceByBrand(filteredPrice);
  const shelf = shelfShareByBrand(filteredMerch);
  const geoPoints = filteredSubmissions
    .filter((s) => s.geo)
    .map((s) => s.geo!)
    .slice(0, 100);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-4 bg-slate-50">
      
      {/* 🧭 SIDEBAR SECONDAIRE : Liste des instances de formulaires et canaux */}
      <div className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          Canaux & Formulaires
        </p>
        <nav className="space-y-1">
          <button
            onClick={() => setSelectedModule("all")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedModule === "all" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BarChart3 size={16} />
            <span>Vue d&apos;sensemble</span>
          </button>
          
          <div className="my-2 border-t border-slate-100" />
          
          <button
            onClick={() => setSelectedModule("price")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedModule === "price" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Tags size={16} />
            <span>Audits de Prix</span>
          </button>

          <button
            onClick={() => setSelectedModule("merch")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedModule === "merch" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid size={16} />
            <span>Merchandising (6P)</span>
          </button>

          <div className="my-2 border-t border-slate-100" />
          
          <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Campagnes Digitales
          </p>

          <button
            onClick={() => setSelectedModule("facebook")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedModule === "facebook" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Globe size={16} className={selectedModule === "facebook" ? "text-blue-600" : ""} />
            <span>Collecte Facebook (Conso)</span>
          </button>

          <button
            onClick={() => setSelectedModule("guide_retail")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
              selectedModule === "guide_retail" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardList size={16} />
            <span>Grande Distribution</span>
          </button>
        </nav>
      </div>

      {/* 📊 PANNEAU PRINCIPAL : Contenu analytique filtré */}
      <div className="flex-1 space-y-6">
        <PageHeader
          title={
            selectedModule === "all" ? "Dashboard Direction" :
            selectedModule === "price" ? "Performances Prix Terrain" :
            selectedModule === "merch" ? "Visibilité Linéaire & Merch" :
            selectedModule === "facebook" ? "Statistiques Campagne Facebook" : "Détails Formulaire Qualitatif"
          }
          subtitle="Suivi analytique en temps réel indexé sur vos objectifs de vente."
        />

        {/* Cartes de KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Interviews" value={kpis.interviews} icon={<Users size={18} />} />
          <StatCard label="Régions" value={kpis.regionsCovered} icon={<MapPin size={18} />} tone="green" />
          <StatCard
            label="Prix moyen"
            value={formatFCFA(kpis.avgOwnPrice)}
            hint={kpis.priceIndex ? `Indice ${Math.round(kpis.priceIndex)}` : undefined}
            icon={<Tags size={18} />}
            tone="amber"
          />
          <StatCard label="Part linéaire" value={`${Math.round(kpis.shareOfShelf * 100)}%`} icon={<LayoutGrid size={18} />} tone="brand" />
          <StatCard label="Disponibilité" value={`${Math.round(kpis.availabilityRate * 100)}%`} icon={<Gauge size={18} />} tone={kpis.availabilityRate < 0.8 ? "red" : "green"} />
          <StatCard label="Satisfaction" value={`${Math.round(kpis.satisfaction * 100)}%`} icon={<Smile size={18} />} tone="green" />
        </div>

        {/* Section Graphiques */}
        <div className="grid gap-4 lg:grid-cols-2">
          {trend.length > 0 && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Volume de Collecte sur 14 Jours</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="interviews" stroke="#D32F2F" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {brands.length > 0 && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Rapport des Prix par Marque (FCFA)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={brands}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatFCFA(v)} />
                  <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]}>
                    {brands.map((b, i) => (
                      <Cell key={i} fill={b.brand === "Bonnet Rouge" ? "#D32F2F" : "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {shelf.length > 0 && (
            <Card>
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Part de Linéaire Réelle</h3>
              <div className="space-y-3">
                {shelf.map((s, i) => (
                  <div key={s.brand}>
                    <div className="mb-1 flex justify-between text-xs text-slate-600">
                      <span>{s.brand}</span>
                      <span className="font-semibold">{Math.round(s.share * 100)}%</span>
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
          )}

          <Card>
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Cartographie des Enquêtes Associées (GPS)</h3>
            <GpsMap points={geoPoints} height={240} />
          </Card>
        </div>
      </div>

    </div>
  );
}