"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Send } from "lucide-react";
import { QuestionRenderer } from "./QuestionRenderer";
import { getDB } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useSync } from "@/lib/sync";
import { getCurrentPosition } from "@/lib/geo";
import { uid, formatDuration } from "@/lib/utils";
import { SIXP_LABELS, type Answer, type Study, type Submission } from "@/lib/types";

function conditionMet(
  study: Study,
  values: Record<string, Answer["value"]>,
  q: Study["questions"][number],
): boolean {
  if (!q.condition) return true;
  const v = values[q.condition.questionId];
  const asArray = Array.isArray(v) ? v : [v];
  return q.condition.equals.some((e) =>
    asArray.map((x) => String(x)).includes(e),
  );
}

export function FormRunner({ study }: { study: Study }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { online, flush, refreshPending } = useSync();

  const startedAt = useRef(Date.now());
  const [values, setValues] = useState<Record<string, Answer["value"]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Submission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visible = useMemo(
    () => study.questions.filter((q) => conditionMet(study, values, q)),
    [study, values],
  );

  const setValue = (id: string, v: Answer["value"]) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const isEmpty = (v: Answer["value"]) =>
    v === null ||
    v === undefined ||
    v === "" ||
    (Array.isArray(v) && v.length === 0);

  const submit = async () => {
    const errs: Record<string, boolean> = {};
    visible.forEach((q) => {
      if (q.required && isEmpty(values[q.id] ?? null)) errs[q.id] = true;
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    const geo = await getCurrentPosition();
    const finishedAt = Date.now();
    const answers: Answer[] = visible.map((q) => ({
      questionId: q.id,
      value: values[q.id] ?? null,
    }));

    const submission: Submission = {
      id: uid("sub"),
      studyId: study.id,
      studyTitle: study.title,
      agentId: user?.id ?? "unknown",
      agentName: user?.name ?? "Enquêteur",
      answers,
      geo: geo ?? undefined,
      startedAt: startedAt.current,
      finishedAt,
      durationSec: Math.round((finishedAt - startedAt.current) / 1000),
      syncStatus: "pending",
      validation: "submitted",
      createdAt: finishedAt,
    };

    await getDB().submissions.add(submission);
    await refreshPending();
    if (online) flush().catch(() => undefined);
    setDone(submission);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
        <h2 className="mt-3 text-xl font-bold text-slate-900">
          Réponse enregistrée
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {online
            ? "Synchronisation en cours vers le serveur."
            : "Stockée localement — sera synchronisée au retour du réseau."}
        </p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-400">
          <Clock size={13} /> Durée interview : {formatDuration(done.durationSec)}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="btn-secondary"
            onClick={() => router.push("/collect")}
          >
            Terminer
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              startedAt.current = Date.now();
              setValues({});
              setErrors({});
              setDone(null);
            }}
          >
            Nouvelle interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card flex items-center gap-3 p-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin size={13} /> GPS capturé à la validation
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={13} /> Horodatage automatique
        </span>
      </div>

      {visible.map((q, i) => (
        <div key={q.id} className="card p-4">
          <div className="mb-2 flex items-start gap-2">
            <span className="text-xs font-semibold text-slate-400">
              {i + 1}.
            </span>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-800">
                {q.label}
                {q.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {q.description && (
                <p className="text-xs text-slate-400">{q.description}</p>
              )}
            </div>
            {q.sixp && (
              <span className="badge bg-slate-100 text-slate-600">
                {SIXP_LABELS[q.sixp]}
              </span>
            )}
          </div>
          <QuestionRenderer
            q={q}
            value={values[q.id] ?? null}
            onChange={(v) => setValue(q.id, v)}
          />
          {errors[q.id] && (
            <p className="mt-1 text-xs text-red-600">
              Cette question est obligatoire.
            </p>
          )}
        </div>
      ))}

      <button
        className="btn-primary w-full"
        onClick={submit}
        disabled={submitting}
      >
        <Send size={16} /> {submitting ? "Enregistrement…" : "Valider la collecte"}
      </button>
    </div>
  );
}
