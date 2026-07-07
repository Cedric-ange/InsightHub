"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db";
import { StudyBuilder } from "@/components/forms/StudyBuilder";
import { PageHeader, EmptyState } from "@/components/ui";

export default function EditStudyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const study = useLiveQuery(() => getDB().studies.get(id), [id]);

  if (study === undefined) {
    return <p className="text-slate-400">Chargement…</p>;
  }
  if (study === null) {
    return (
      <EmptyState
        title="Étude introuvable"
        description="Cette étude n'existe pas ou a été supprimée."
      />
    );
  }

  return (
    <div>
      <PageHeader title="Éditer l'étude" subtitle={study.title} />
      <StudyBuilder initial={study} />
    </div>
  );
}
