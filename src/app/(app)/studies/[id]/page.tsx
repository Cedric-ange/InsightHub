"use client";

import { use } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db";
import { StudyBuilder } from "@/components/forms/StudyBuilder";
import { PageHeader, EmptyState } from "@/components/ui";
import Link from "next/link";

export default function EditStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const study = useLiveQuery(() => getDB().studies.get(id), [id]);

  if (study === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Extraction du questionnaire...</p>
      </div>
    );
  }

  if (study === null) {
    return (
      <EmptyState
        title="Formulaire Introuvable"
        description="Ce modèle d'étude n'existe pas ou a été archivé par la direction commerciale."
        action={
          <Link href="/studies" className="inline-flex items-center px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg shadow">
            Retour à la liste
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Éditer le Questionnaire" 
        subtitle={`Modèle : ${study.title}`} 
      />
      <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
        <StudyBuilder initial={study} />
      </div>
    </div>
  );
}