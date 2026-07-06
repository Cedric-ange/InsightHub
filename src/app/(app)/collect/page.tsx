"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { ClipboardList, ChevronRight, Tags, Store } from "lucide-react";
import { getDB } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { STUDY_CATEGORY_LABELS } from "@/lib/types";
import { EmptyState } from "@/components/ui";

export default function CollectHomePage() {
  const user = useAuth((s) => s.user);
  const studies = useLiveQuery(
    () => getDB().studies.where("status").equals("published").toArray(),
    [],
  );

  return (
    <div>
      <div className="mb-6 rounded-xl bg-brand-950 p-5 text-white">
        <p className="text-sm text-brand-200">Bonjour</p>
        <h1 className="text-2xl font-bold">{user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-brand-200">
          Études disponibles pour la collecte terrain. L&apos;application
          fonctionne hors connexion.
        </p>
      </div>

      {/* Quick specialised modules */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/audit-prix"
          className="card flex items-center gap-3 p-4 hover:border-brand-300"
        >
          <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
            <Tags size={20} />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800">Audit Prix</div>
            <div className="text-xs text-slate-500">Relevé rapide</div>
          </div>
        </Link>
        <Link
          href="/merchandising"
          className="card flex items-center gap-3 p-4 hover:border-brand-300"
        >
          <span className="rounded-lg bg-brand-50 p-2 text-brand-600">
            <Store size={20} />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-800">
              Merchandising
            </div>
            <div className="text-xs text-slate-500">Relevé rayon</div>
          </div>
        </Link>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Questionnaires
      </h2>

      {!studies ? (
        <p className="text-slate-400">Chargement…</p>
      ) : studies.length === 0 ? (
        <EmptyState
          title="Aucune étude publiée"
          description="Les études publiées par les analystes apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
          {studies.map((s) => (
            <Link
              key={s.id}
              href={`/collect/${s.id}`}
              className="card flex items-center gap-3 p-4 hover:border-brand-300"
            >
              <span className="rounded-lg bg-brand-50 p-2.5 text-brand-600">
                <ClipboardList size={20} />
              </span>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{s.title}</div>
                <div className="text-xs text-slate-500">
                  {STUDY_CATEGORY_LABELS[s.category]} · {s.questions.length}{" "}
                  questions
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
