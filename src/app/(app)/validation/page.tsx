"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Check, X, CheckCircle2, Clock, MapPin } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader, EmptyState, Card } from "@/components/ui";
import type { ValidationStatus } from "@/lib/types";
import { formatDateTime, formatDuration, cn } from "@/lib/utils";

const TABS: { key: ValidationStatus; label: string }[] = [
  { key: "submitted", label: "À valider" },
  { key: "validated", label: "Validées" },
  { key: "rejected", label: "Rejetées" },
];

export default function ValidationPage() {
  const [tab, setTab] = useState<ValidationStatus>("submitted");

  const submissions = useLiveQuery(
    () => getDB().submissions.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const setStatus = async (id: string, validation: ValidationStatus) => {
    await getDB().submissions.update(id, { validation });
  };

  const list = (submissions ?? []).filter((s) => s.validation === tab);

  return (
    <div>
      <PageHeader
        title="Workflow de validation"
        subtitle="Enquêteur → Superviseur → Validation → Publication Dashboard."
      />

      <div className="mb-5 flex gap-2">
        {TABS.map((t) => {
          const count = (submissions ?? []).filter(
            (s) => s.validation === t.key,
          ).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium",
                tab === t.key
                  ? "bg-brand-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {t.label}
              <span className="ml-2 text-xs opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {!submissions ? (
        <p className="text-slate-400">Chargement…</p>
      ) : list.length === 0 ? (
        <EmptyState
          title="Rien à afficher"
          description="Aucune collecte dans cette catégorie."
        />
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold text-slate-800">
                  {s.studyTitle}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{s.agentName}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {formatDuration(s.durationSec)}
                  </span>
                  {s.geo && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {s.geo.lat.toFixed(3)},{" "}
                      {s.geo.lng.toFixed(3)}
                    </span>
                  )}
                  <span>{formatDateTime(s.createdAt)}</span>
                  <span>· {s.answers.length} réponses</span>
                </div>
              </div>
              {tab === "submitted" ? (
                <div className="flex gap-2">
                  <button
                    className="btn-secondary py-1.5 text-xs text-red-600 hover:bg-red-50"
                    onClick={() => setStatus(s.id, "rejected")}
                  >
                    <X size={14} /> Rejeter
                  </button>
                  <button
                    className="btn-primary py-1.5 text-xs"
                    onClick={() => setStatus(s.id, "validated")}
                  >
                    <Check size={14} /> Valider
                  </button>
                </div>
              ) : tab === "validated" ? (
                <span className="badge gap-1 bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={13} /> Publiée
                </span>
              ) : (
                <button
                  className="btn-secondary py-1.5 text-xs"
                  onClick={() => setStatus(s.id, "submitted")}
                >
                  Rouvrir
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
