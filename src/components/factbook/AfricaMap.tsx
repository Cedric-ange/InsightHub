"use client";

import { useState } from "react";
import {
  AFRICA_MAP,
  FACTBOOK,
  NO_DATA_COLOR,
  buildChoroplethScale,
  formatIndicator,
  getCountry,
  type Indicator,
} from "@/lib/factbook";
import { cn } from "@/lib/utils";

const COVERED = new Set(FACTBOOK.map((item) => item.iso3));

export function AfricaMap({
  indicator,
  selected,
  onSelect,
}: {
  indicator: Indicator;
  selected: string;
  onSelect: (iso3: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const scale = buildChoroplethScale(indicator);
  const active = hovered ?? selected;
  const activeCountry = getCountry(active);

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${AFRICA_MAP.width} ${AFRICA_MAP.height}`}
          className="h-[520px] w-full"
          role="img"
          aria-label={`Carte de l'Afrique — ${indicator.label}`}
        >
          {AFRICA_MAP.countries.map((shape) => {
            const covered = COVERED.has(shape.iso3);
            const isActive = covered && shape.iso3 === active;
            return (
              <path
                key={shape.iso3}
                d={shape.d}
                fill={covered ? scale.colorFor(shape.iso3) : NO_DATA_COLOR}
                stroke={isActive ? "#D32F2F" : "#ffffff"}
                strokeWidth={isActive ? 2 : 0.6}
                className={cn(
                  "transition-[stroke,opacity]",
                  covered ? "cursor-pointer hover:opacity-80" : "opacity-60",
                )}
                onMouseEnter={() => covered && setHovered(shape.iso3)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => covered && onSelect(shape.iso3)}
                tabIndex={covered ? 0 : -1}
                onFocus={() => covered && setHovered(shape.iso3)}
                onBlur={() => setHovered(null)}
                onKeyDown={(event) => {
                  if (covered && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onSelect(shape.iso3);
                  }
                }}
              >
                <title>{covered ? shape.name : `${shape.name} — hors périmètre`}</title>
              </path>
            );
          })}
        </svg>

        {activeCountry && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{activeCountry.country}</p>
            <p className="text-xs text-slate-500">
              {indicator.label} :{" "}
              <span className="font-semibold text-brand-700">
                {formatIndicator(activeCountry[indicator.key], indicator.format)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {scale.legend.map((step) => (
          <span key={step.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span
              className="inline-block h-3 w-5 rounded-sm border border-slate-200"
              style={{ backgroundColor: step.color }}
            />
            {step.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-slate-200"
            style={{ backgroundColor: NO_DATA_COLOR }}
          />
          Hors périmètre / N/D
        </span>
      </div>
    </div>
  );
}
