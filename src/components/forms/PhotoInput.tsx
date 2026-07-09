"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";

// Reads a captured/selected image as a data URL so it can be stored offline
// in IndexedDB and synced later.
export function PhotoInput({
  value,
  onChange,
  label = "Prendre une photo",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* Association d'un aria-label et d'un title pour satisfaire l'accessibilité Chrome/Lighthouse */}
      <input
        ref={inputRef}
        id="camera-capture-input"
        type="file"
        accept="image/*"
        capture="environment"
        title="Prendre une photo du rayon avec l'appareil photo"
        aria-label="Prendre une photo du rayon avec l'appareil photo"
        className="hidden"
        onChange={handle}
      />
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Photo du rayon capturée"
            className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
            aria-label="Retirer la photo"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-secondary"
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={16} /> {label}
        </button>
      )}
    </div>
  );
}