"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, Lightbulb, Target, TrendingUp } from "lucide-react";
import { getDB } from "@/lib/db";
import { computeKPIs } from "@/lib/analytics";
import { generateInsights, type Insight } from "@/lib/sixp";
import { SIXP_LABELS, type SixP } from "@/lib/types";
import { PageHeader, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const SEVERITY: Record<Insight["severity"], string> = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-amber-500 bg-amber-50",
  low: "border-l-emerald-500 bg-emerald-50",
};
const SEVERITY_LABEL: Record<Insight["severity"], string> = {
  high: "Priorité haute",
  medium: "À surveiller",
  low: "Sain",
};

export default function AnalyticsPage() {
  const data = useLiveQuery(async () => {
    const db = getDB();
    const [submissions, price, merch] = await Promise.all([
      db.submissions.toArray(),
      db.priceAudits.toArray(),
      db.merchAudits.toArray(),
    ]);
    return { submissions, price, merch };
  }, []);

  if (!data) return <p className="text-slate-400">Chargement…</p>;

  const kpis = computeKPIs(data.submissions, data.price, data.merch);
  const insights = generateInsights({
    availabilityRate: kpis.availabilityRate,
    ownPriceIndex: kpis.priceIndex,
    purchaseIntent: kpis.purchaseIntent,
    visibilityRate: kpis.shareOfShelf,
    satisfaction: kpis.satisfaction,
    region: "Abidjan",
  });

  // 6P scorecard (0..100).
  const sixp: { pillar: SixP; score: number; caption: string }[] = [
    {
      pillar: "PRODUCT",
      score: Math.round(kpis.satisfaction * 100),
      caption: "Satisfaction & qualité",
    },
    {
      pillar: "PRICE",
      score: Math.max(0, Math.round(100 - Math.abs(kpis.priceIndex - 100))),
      caption: `Indice prix ${Math.round(kpis.priceIndex)}`,
    },
    {
      pillar: "PLACE",
      score: Math.round(kpis.availabilityRate * 100),
      caption: "Distribution & disponibilité",
    },
    {
      pillar: "PROMOTION",
      score: Math.round(kpis.shareOfShelf * 100),
      caption: "Visibilité & activations",
    },
    {
      pillar: "PACK",
      score: Math.round(kpis.satisfaction * 95),
      caption: "Évaluation packaging",
    },
    {
      pillar: "PROPOSITION",
      score: Math.round(kpis.purchaseIntent * 100),
      caption: "Intention d'achat / image",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Analytics & Insights"
        subtitle="Au lieu de montrer des réponses, montrer des insights — reliés à l'IBP et au modèle 6P."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sixp.map((p) => (
          <Card key={p.pillar} className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {SIXP_LABELS[p.pillar]}
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {p.score}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  p.score >= 70
                    ? "bg-emerald-500"
                    : p.score >= 50
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
                style={{ width: `${p.score}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400">{p.caption}</div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        <TrendingUp size={15} /> Insights générés automatiquement
      </h2>

      <div className="space-y-4">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={cn(
              "card border-l-4 p-5",
              SEVERITY[ins.severity],
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="badge bg-white/70 text-slate-700">
                {ins.pillar === "GENERAL" ? "Global" : SIXP_LABELS[ins.pillar]}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {SEVERITY_LABEL[ins.severity]}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <AlertTriangle size={13} /> Surface Issue
                </div>
                <p className="text-sm font-medium text-slate-800">
                  {ins.surface}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Target size={13} /> Root Cause
                </div>
                <p className="text-sm text-slate-700">{ins.rootCause}</p>
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Lightbulb size={13} /> Recommandation
                </div>
                <p className="text-sm text-slate-700">{ins.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
