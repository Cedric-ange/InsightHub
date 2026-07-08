"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui";
import {
  STUDY_CATEGORY_LABELS,
  type StudyStatus,
} from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

const STATUS_STYLE: Record<StudyStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-amber-100 text-amber-800",
};
const STATUS_LABEL: Record<StudyStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  archived: "Archivée",
};

export default function StudiesPage() {
  const studies = useLiveQuery(
    () => getDB().studies.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const remove = async (id: string) => {
    if (confirm("Supprimer définitivement cette étude ?")) {
      await getDB().studies.delete(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Questionnaires"
        subtitle="Créez des études sans connaissance technique."
        action={
          <Link href="/studies/new" className="btn-primary">
            <Plus size={16} /> Nouvelle étude
          </Link>
        }
      />

      {!studies ? (
        <p className="text-slate-400">Chargement…</p>
      ) : studies.length === 0 ? (
        <EmptyState
          title="Aucune étude"
          description="Créez votre premier questionnaire pour lancer une collecte terrain."
          action={
            <Link href="/studies/new" className="btn-primary">
              <Plus size={16} /> Nouvelle étude
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <div key={s.id} className="card flex flex-col p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <FileText size={18} />
                </div>
                <span className={cn("badge", STATUS_STYLE[s.status])}>
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {s.description || "—"}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span>{STUDY_CATEGORY_LABELS[s.category]}</span>
                <span>·</span>
                <span>{s.questions.length} questions</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Créée le {formatDate(s.createdAt)}
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/studies/${s.id}`}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  <Pencil size={14} /> Éditer
                </Link>
                <button
                  onClick={() => remove(s.id)}
                  aria-label="Supprimer le questionnaire"
                  title="Supprimer"
                  className="btn-secondary py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
