"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db";
import { FormRunner } from "@/components/forms/FormRunner";
import { PageHeader, EmptyState } from "@/components/ui";

export default function CollectFormPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const study = useLiveQuery(() => getDB().studies.get(id), [id]);

  if (study === undefined) {
    return <p className="text-slate-400">Chargement…</p>;
  }
  if (!study) {
    return (
      <EmptyState
        title="Étude introuvable"
        description="Cette étude n'est pas disponible pour la collecte."
      />
    );
  }

  return (
    <div>
      <PageHeader title={study.title} subtitle={study.description} />
      <FormRunner study={study} />
    </div>
  );
}
