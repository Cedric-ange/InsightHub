"use client";

import type { GeoPoint } from "@/lib/types";

// Lightweight offline-friendly GPS scatter plot (no external tiles).
// Plots points within a Côte d'Ivoire bounding box onto an SVG canvas.
const BOUNDS = { minLat: 4.3, maxLat: 10.8, minLng: -8.7, maxLng: -2.4 };

export function GpsMap({
  points,
  height = 240,
}: {
  points: GeoPoint[];
  height?: number;
}) {
  const w = 100;
  const h = 100;

  const project = (p: GeoPoint) => {
    const x =
      ((p.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * w;
    const y =
      (1 - (p.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * h;
    return { x, y };
  };

  const valid = points.filter(
    (p) =>
      p.lat >= BOUNDS.minLat &&
      p.lat <= BOUNDS.maxLat &&
      p.lng >= BOUNDS.minLng &&
      p.lng <= BOUNDS.maxLng,
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-brand-50"
      style={{ height }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <rect x={0} y={0} width={w} height={h} fill="#fef2f2" />
        {valid.map((p, i) => {
          const { x, y } = project(p);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1.1}
              fill="#D32F2F"
              fillOpacity={0.7}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute bottom-2 right-2 rounded bg-white/80 px-2 py-1 text-[10px] text-slate-600">
        {valid.length} points · Côte d&apos;Ivoire
      </div>
    </div>
  );
}
