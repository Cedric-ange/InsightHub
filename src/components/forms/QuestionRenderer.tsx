"use client";

import { MapPin, QrCode, Barcode, Mic } from "lucide-react";
import type { Answer, Question } from "@/lib/types";
import { getCurrentPosition } from "@/lib/geo";
import { SignaturePad } from "./SignaturePad";
import { PhotoInput } from "./PhotoInput";

type Value = Answer["value"];

export function QuestionRenderer({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: Value;
  onChange: (v: Value) => void;
}) {
  // Définition d'un identifiant technique unique d'accessibilité basé sur la question
  const fieldId = `field-${q.id}`;
  const fieldTitle = q.label || "Champ de saisie du questionnaire";

  switch (q.type) {
    case "text":
      return (
        <input
          id={fieldId}
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input"
          placeholder="Saisissez votre réponse..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "long_text":
      return (
        <textarea
          id={fieldId}
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input min-h-[90px]"
          placeholder="Saisissez votre commentaire détaillé..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          id={fieldId}
          type="number"
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input"
          min={q.min}
          max={q.max}
          placeholder="0"
          value={value === null || value === undefined ? "" : (value as number)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
        />
      );
    case "date":
      return (
        <input
          id={fieldId}
          type="date"
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "time":
      return (
        <input
          id={fieldId}
          type="time"
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "boolean":
      return (
        <div className="flex gap-2">
          {["Oui", "Non"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt === "Oui")}
              className={
                (value === (opt === "Oui")
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-300 text-slate-600") +
                " flex-1 rounded-lg border px-4 py-2 text-sm font-medium"
              }
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case "select":
      return (
        <select
          id={fieldId}
          title={fieldTitle}
          aria-label={fieldTitle}
          className="input"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">— Sélectionner —</option>
          {(q.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "single_choice":
      return (
        <div className="space-y-2">
          {(q.options ?? []).map((o, idx) => {
            const choiceId = `${fieldId}-choice-${idx}`;
            return (
              <label
                key={o}
                htmlFor={choiceId}
                className={
                  (value === o
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200") +
                  " flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                }
              >
                <input
                  id={choiceId}
                  type="radio"
                  name={q.id}
                  title={o}
                  checked={value === o}
                  onChange={() => onChange(o)}
                />
                {o}
              </label>
            );
          })}
        </div>
      );
    case "multi_choice": {
      const arr = (value as string[]) ?? [];
      return (
        <div className="space-y-2">
          {(q.options ?? []).map((o, idx) => {
            const checkId = `${fieldId}-check-${idx}`;
            const checked = arr.includes(o);
            return (
              <label
                key={o}
                htmlFor={checkId}
                className={
                  (checked ? "border-brand-500 bg-brand-50" : "border-slate-200") +
                  " flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                }
              >
                <input
                  id={checkId}
                  type="checkbox"
                  title={o}
                  checked={checked}
                  onChange={() =>
                    onChange(
                      checked ? arr.filter((x) => x !== o) : [...arr, o],
                    )
                  }
                />
                {o}
              </label>
            );
          })}
        </div>
      );
    }
    case "nps": {
      const cur = value as number | null;
      return (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              type="button"
              title={`Note ${n}`}
              onClick={() => onChange(n)}
              className={
                (cur === n
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200") +
                " h-9 w-9 rounded-lg text-sm font-medium"
              }
            >
              {n}
            </button>
          ))}
        </div>
      );
    }
    case "rating": {
      const min = q.min ?? 1;
      const max = q.max ?? 5;
      const cur = value as number | null;
      return (
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
            <button
              key={n}
              type="button"
              title={`Évaluation Étoile ${n}`}
              onClick={() => onChange(n)}
              className={
                (cur === n
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200") +
                " h-9 min-w-9 rounded-lg px-2 text-sm font-medium"
              }
            >
              {n}
            </button>
          ))}
        </div>
      );
    }
    case "ranking": {
      const order = (value as string[]) ?? q.options ?? [];
      const moveItem = (idx: number, dir: -1 | 1) => {
        const next = [...order];
        const t = idx + dir;
        if (t < 0 || t >= next.length) return;
        [next[idx], next[t]] = [next[t], next[idx]];
        onChange(next);
      };
      return (
        <div className="space-y-1">
          {order.map((o, idx) => (
            <div
              key={o}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <span className="font-semibold text-slate-400">{idx + 1}.</span>
              <span className="flex-1">{o}</span>
              <button
                type="button"
                className="text-slate-400 disabled:opacity-30"
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                aria-label={`Monter l'élément ${o}`}
              >
                ↑
              </button>
              <button
                type="button"
                className="text-slate-400 disabled:opacity-30"
                onClick={() => moveItem(idx, 1)}
                disabled={idx === order.length - 1}
                aria-label={`Descendre l'élément ${o}`}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      );
    }
    case "signature":
      return (
        <SignaturePad
          value={(value as string) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case "photo":
      return (
        <PhotoInput
          value={(value as string) ?? null}
          onChange={(v) => onChange(v)}
        />
      );
    case "audio":
      return (
        <label htmlFor={`${fieldId}-audio-input`} className="btn-secondary cursor-pointer">
          <Mic size={16} /> Enregistrer un audio
          <input
            id={`${fieldId}-audio-input`}
            type="file"
            accept="audio/*"
            capture="user" // Correction : Attribution de la valeur conforme "user" pour micro frontal
            title="Enregistrer un mémo audio"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      );
    case "video":
      return (
        <label htmlFor={`${fieldId}-video-input`} className="btn-secondary cursor-pointer">
          Filmer une vidéo
          <input
            id={`${fieldId}-video-input`}
            type="file"
            accept="video/*"
            capture="environment" // Correction : Utilisation d'une chaîne valide pour la caméra arrière
            title="Filmer le linéaire de vente"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      );
    case "qr":
    case "barcode":
      return (
        <div className="flex items-center gap-2">
          <span className="text-slate-400">
            {q.type === "qr" ? <QrCode size={18} /> : <Barcode size={18} />}
          </span>
          <input
            id={fieldId}
            title={q.type === "qr" ? "Scanner un code QR" : "Scanner un code-barres"}
            aria-label={q.type === "qr" ? "Scanner un code QR" : "Scanner un code-barres"}
            className="input"
            placeholder="Scanner ou saisir le code..."
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "gps": {
      const geo = value as unknown as { lat: number; lng: number } | null;
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              const p = await getCurrentPosition();
              onChange(
                p ? (`${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` as string) : null,
              );
            }}
          >
            <MapPin size={16} /> Capturer ma position
          </button>
          {typeof value === "string" && value && (
            <span className="text-sm text-slate-500">{value}</span>
          )}
          {geo && typeof value !== "string" && (
            <span className="text-sm text-slate-500">
              {geo.lat}, {geo.lng}
            </span>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}