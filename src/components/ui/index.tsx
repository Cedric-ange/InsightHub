import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SyncStatus } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "brand" | "green" | "amber" | "red" | "slate";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon && (
          <span className={cn("rounded-lg p-2", tones[tone])}>{icon}</span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("card p-5", className)}>{children}</div>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SyncBadge({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { cls: string; label: string }> = {
    pending: { cls: "bg-amber-100 text-amber-800", label: "En attente" },
    synced: { cls: "bg-emerald-100 text-emerald-800", label: "Synchronisé" },
    error: { cls: "bg-red-100 text-red-800", label: "Erreur" },
  };
  const { cls, label } = map[status];
  return <span className={cn("badge", cls)}>{label}</span>;
}
