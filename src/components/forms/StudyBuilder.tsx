"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  GripVertical,
} from "lucide-react";
import { getDB } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { uid } from "@/lib/utils";
import {
  QUESTION_TYPE_LABELS,
  SIXP_LABELS,
  STUDY_CATEGORY_LABELS,
  type Question,
  type QuestionType,
  type SixP,
  type Study,
  type StudyCategory,
  type StudyStatus,
} from "@/lib/types";

const CHOICE_TYPES: QuestionType[] = [
  "select",
  "single_choice",
  "multi_choice",
  "ranking",
];
const RANGE_TYPES: QuestionType[] = ["number", "rating"];

function emptyQuestion(): Question {
  return {
    id: uid("q"),
    type: "text",
    label: "",
    required: false,
  };
}

export function StudyBuilder({ initial }: { initial?: Study }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<StudyCategory>(
    initial?.category ?? "consumer",
  );
  const [status, setStatus] = useState<StudyStatus>(initial?.status ?? "draft");
  const [questions, setQuestions] = useState<Question[]>(
    initial?.questions ?? [emptyQuestion()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Question>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const move = (index: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const next = [...qs];
      const target = index + dir;
      if (target < 0 || target >= next.length) return qs;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Le titre de l'étude est obligatoire.");
      return;
    }
    if (questions.some((q) => !q.label.trim())) {
      setError("Chaque question doit avoir un libellé.");
      return;
    }
    setSaving(true);
    const now = Date.now();
    const study: Study = {
      id: initial?.id ?? uid("study"),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      status,
      questions,
      createdBy: initial?.createdBy ?? user?.id ?? "unknown",
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    await getDB().studies.put(study);
    router.push("/studies");
  };

  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-5">
        <div>
          <label className="label">Titre de l&apos;étude *</label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Dégustation nouvelle marque Biscuit"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[70px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objectif de l'étude, contexte…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Catégorie</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as StudyCategory)}
            >
              {Object.entries(STUDY_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Statut</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as StudyStatus)}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publiée (visible terrain)</option>
              <option value="archived">Archivée</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <QuestionEditor
            key={q.id}
            q={q}
            index={index}
            total={questions.length}
            others={questions.filter((o) => o.id !== q.id)}
            onChange={(patch) => update(q.id, patch)}
            onRemove={() =>
              setQuestions((qs) => qs.filter((x) => x.id !== q.id))
            }
            onMove={(dir) => move(index, dir)}
          />
        ))}
      </div>

      <button
        className="btn-secondary w-full"
        onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
      >
        <Plus size={16} /> Ajouter une question
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={() => router.push("/studies")}>
          Annuler
        </button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          <Save size={16} /> {saving ? "Enregistrement…" : "Enregistrer l'étude"}
        </button>
      </div>
    </div>
  );
}

function QuestionEditor({
  q,
  index,
  total,
  others,
  onChange,
  onRemove,
  onMove,
}: {
  q: Question;
  index: number;
  total: number;
  others: Question[];
  onChange: (patch: Partial<Question>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const isChoice = CHOICE_TYPES.includes(q.type);
  const isRange = RANGE_TYPES.includes(q.type);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <GripVertical size={16} className="text-slate-300" />
        <span className="text-xs font-semibold text-slate-400">
          Question {index + 1}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Monter"
          >
            <ArrowUp size={15} />
          </button>
          <button
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Descendre"
          >
            <ArrowDown size={15} />
          </button>
          <button
            className="rounded p-1.5 text-red-400 hover:bg-red-50"
            onClick={onRemove}
            aria-label="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Libellé *</label>
          <input
            className="input"
            value={q.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Ex : Avez-vous apprécié le goût ?"
          />
        </div>
        <div>
          <label className="label">Type</label>
          <select
            className="input"
            value={q.type}
            onChange={(e) =>
              onChange({ type: e.target.value as QuestionType })
            }
          >
            {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pilier 6P (optionnel)</label>
          <select
            className="input"
            value={q.sixp ?? ""}
            onChange={(e) =>
              onChange({ sixp: (e.target.value || undefined) as SixP })
            }
          >
            <option value="">—</option>
            {Object.entries(SIXP_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {isChoice && (
          <div className="sm:col-span-2">
            <label className="label">Options (une par ligne)</label>
            <textarea
              className="input min-h-[80px]"
              value={(q.options ?? []).join("\n")}
              onChange={(e) =>
                onChange({
                  options: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder={"Option 1\nOption 2\nOption 3"}
            />
          </div>
        )}

        {isRange && (
          <>
            <div>
              <label className="label">Min</label>
              <input
                type="number"
                className="input"
                value={q.min ?? ""}
                onChange={(e) =>
                  onChange({
                    min: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">Max</label>
              <input
                type="number"
                className="input"
                value={q.max ?? ""}
                onChange={(e) =>
                  onChange({
                    max: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={q.required}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
          Obligatoire
        </label>
      </div>

      {/* Conditional logic / logic jump */}
      {others.length > 0 && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Affichage conditionnel (saut logique)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="input"
              value={q.condition?.questionId ?? ""}
              onChange={(e) =>
                onChange({
                  condition: e.target.value
                    ? { questionId: e.target.value, equals: [] }
                    : undefined,
                })
              }
            >
              <option value="">Toujours afficher</option>
              {others
                .filter((o) => o.label.trim())
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    Si « {o.label} »
                  </option>
                ))}
            </select>
            {q.condition && (
              <input
                className="input"
                placeholder="= valeur(s), séparées par des virgules"
                value={q.condition.equals.join(", ")}
                onChange={(e) =>
                  onChange({
                    condition: {
                      questionId: q.condition!.questionId,
                      equals: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
