"use client";

import LinkNext from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, FileText, Pencil, Trash2, Search } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/ui";
import { STUDY_CATEGORY_LABELS, type StudyStatus } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { useState } from "react";

const STATUS_STYLE: Record<StudyStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  archived: "bg-amber-50 text-amber-700 border-amber-200/50",
};

const STATUS_LABEL: Record<StudyStatus, string> = {
  draft: "Brouillon",
  published: "Publiée Terrain",
  archived: "Archivée",
};

export default function StudiesPage() {
  const [search, setSearch] = useState("");

  // Tri sécurisé par date de création décroissante
  const studies = useLiveQuery(
    () => getDB().studies.orderBy("createdAt").reverse().toArray(),
    []
  );

  const remove = async (id: string, title: string) => {
    if (confirm(`Supprimer définitivement le modèle corporate : "${title}" ?`)) {
      await getDB().studies.delete(id);
    }
  };

  const filteredStudies = studies?.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modèles de Questionnaires"
        subtitle="Gérez et déployez vos formulaires d'audit marché alignés sur le modèle IBP / 6P."
        action={
          <LinkNext href="/studies/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-accent-500/20 active:scale-[0.99] transition-all">
            <Plus size={16} /> Nouvelle étude
          </LinkNext>
        }
      />

      {/* Barre de recherche haut de gamme corrigée */}
      {studies && studies.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            placeholder="Rechercher une étude corporate (ex: Bonnet Rouge Format Familial)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner"
          />
        </div>
      )}

      {!studies ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Chargement des modèles Friesland...</p>
        </div>
      ) : studies.length === 0 ? (
        <EmptyState
          title="Aucun questionnaire configuré"
          description="Créez votre premier formulaire 6P pour lancer vos enquêtes de terrain."
          action={
            <LinkNext href="/studies/new" className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm rounded-lg transition-all">
              <Plus size={16} /> Nouvelle étude
            </LinkNext>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudies.map((s) => (
            <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-100 transition-all flex flex-col justify-between group relative">
              <div>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border", STATUS_STYLE[s.status])}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors">
                  {s.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                  {s.description || "Aucune description fournie pour ce modèle."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-600">{STUDY_CATEGORY_LABELS[s.category]}</span>
                  <span>·</span>
                  <span className="text-brand-600 font-bold">{s.questions?.length || 0} questions</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-slate-400">
                  Fait le {formatDate(s.createdAt)}
                </span>
                
                <div className="flex items-center gap-2">
                  <LinkNext
                    href={`/studies/${s.id}`}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded-lg text-xs font-bold text-slate-700 hover:text-brand-700 transition-all"
                  >
                    <Pencil size={13} /> Éditer
                  </LinkNext>
                  <button
                    onClick={() => remove(s.id, s.title)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50/50 border border-transparent hover:border-red-100 transition-all"
                    title="Supprimer définitivement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}