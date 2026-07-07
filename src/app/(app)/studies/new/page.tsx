"use client";

import { StudyBuilder } from "@/components/forms/StudyBuilder";
import { PageHeader } from "@/components/ui";

export default function NewStudyPage() {
  return (
    <div>
      <PageHeader
        title="Nouvelle étude"
        subtitle="Composez votre questionnaire question par question."
      />
      <StudyBuilder />
    </div>
  );
}
