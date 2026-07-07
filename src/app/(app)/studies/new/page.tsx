"use client";

import { StudyBuilder } from "@/components/forms/StudyBuilder";
import { PageHeader } from "@/components/ui";

export default function NewStudyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle Étude Corporate"
        subtitle="Composez votre grille d'évaluation stratégique question par question pour le terrain."
      />
      <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
        <StudyBuilder />
      </div>
    </div>
  );
}