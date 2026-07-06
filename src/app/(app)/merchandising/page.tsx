"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, LayoutGrid, CheckCircle2 } from "lucide-react";
import { getDB } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useSync } from "@/lib/sync";
import { getCurrentPosition } from "@/lib/geo";
import { PageHeader, StatCard, Card, SyncBadge } from "@/components/ui";
import { PhotoInput } from "@/components/forms/PhotoInput";
import { shelfShareByBrand } from "@/lib/analytics";
import { uid, formatDate, cn } from "@/lib/utils";
import type { MerchAudit } from "@/lib/types";

const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque", "Boutique"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"];
const REGIONS = ["Abidjan", "Bouaké", "San Pedro"];
const POSITIONS: { v: MerchAudit["shelfPosition"]; l: string }[] = [
  { v: "eye", l: "Niveau des yeux" },
  { v: "top", l: "Haut" },
  { v: "middle", l: "Milieu" },
  { v: "bottom", l: "Bas" },
];
const PIE = ["#2145d1", "#0ea5a4", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function MerchandisingPage() {
  const user = useAuth((s) => s.user);
  const { online, flush, refreshPending } = useSync();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  const audits = useLiveQuery(
    () => getDB().merchAudits.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [form, setForm] = useState({
    outlet: OUTLETS[0],
    channel: CHANNELS[1],
    isOwnBrand: true,
    brand: "Notre marque",
    facings: "",
    shelfLengthCm: "",
    shelfPosition: "eye" as MerchAudit["shelfPosition"],
    outOfStock: false,
    plvPresent: false,
    activationPresent: false,
    region: REGIONS[0],
    photoBefore: null as string | null,
    photoAfter: null as string | null,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (form.facings === "") return;
    const geo = await getCurrentPosition();
    const rec: MerchAudit = {
      id: uid("ma"),
      outlet: form.outlet,
      channel: form.channel,
      brand: form.isOwnBrand ? "Notre marque" : form.brand.trim() || "Concurrent",
      isOwnBrand: form.isOwnBrand,
      facings: Number(form.facings),
      shelfLengthCm: form.shelfLengthCm ? Number(form.shelfLengthCm) : 0,
      shelfPosition: form.shelfPosition,
      outOfStock: form.outOfStock,
      plvPresent: form.plvPresent,
      activationPresent: form.activationPresent,
      region: form.region,
      photoBefore: form.photoBefore ?? undefined,
      photoAfter: form.photoAfter ?? undefined,
      geo: geo ?? undefined,
      agentId: user?.id ?? "unknown",
      agentName: user?.name ?? "Enquêteur",
      syncStatus: "pending",
      createdAt: Date.now(),
    };
    await getDB().merchAudits.add(rec);
    await refreshPending();
    if (online) flush().catch(() => undefined);
    setForm((f) => ({
      ...f,
      facings: "",
      shelfLengthCm: "",
      photoBefore: null,
      photoAfter: null,
    }));
    setOpen(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  };

  const list = audits ?? [];
  const shelf = shelfShareByBrand(list);
  const ownShare = shelf.find((s) => s.brand === "Notre marque")?.share ?? 0;
  const oosRate =
    list.length > 0 ? list.filter((m) => m.outOfStock).length / list.length : 0;
  const plvRate =
    list.length > 0 ? list.filter((m) => m.plvPresent).length / list.length : 0;

  return (
    <div>
      <PageHeader
        title="Merchandising"
        subtitle="Mesurez visibilité, disponibilité et part de linéaire. Photos avant / après."
        action={
          <button className="btn-primary" onClick={() => setOpen((o) => !o)}>
            <Plus size={16} /> Nouveau relevé
          </button>
        }
      />

      {flash && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} /> Relevé enregistré{" "}
          {online ? "et synchronisé" : "localement (hors ligne)"}.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Part de linéaire"
          value={`${Math.round(ownShare * 100)}%`}
          icon={<LayoutGrid size={18} />}
          tone="brand"
        />
        <StatCard
          label="Taux de rupture"
          value={`${Math.round(oosRate * 100)}%`}
          tone={oosRate > 0.15 ? "red" : "green"}
        />
        <StatCard
          label="Présence PLV"
          value={`${Math.round(plvRate * 100)}%`}
          tone="amber"
        />
        <StatCard label="Relevés" value={list.length} tone="slate" />
      </div>

      {open && (
        <Card className="mt-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Relevé merchandising</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Point de vente</label>
              <select
                className="input"
                value={form.outlet}
                onChange={(e) => set("outlet", e.target.value)}
              >
                {OUTLETS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Canal</label>
              <select
                className="input"
                value={form.channel}
                onChange={(e) => set("channel", e.target.value)}
              >
                {CHANNELS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Marque</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set("isOwnBrand", true)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm",
                    form.isOwnBrand
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-300 text-slate-600",
                  )}
                >
                  Notre marque
                </button>
                <button
                  type="button"
                  onClick={() => set("isOwnBrand", false)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-sm",
                    !form.isOwnBrand
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-300 text-slate-600",
                  )}
                >
                  Concurrent
                </button>
              </div>
              {!form.isOwnBrand && (
                <input
                  className="input mt-2"
                  placeholder="Nom du concurrent"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="label">Région</label>
              <select
                className="input"
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
              >
                {REGIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nombre de facings *</label>
              <input
                type="number"
                className="input"
                value={form.facings}
                onChange={(e) => set("facings", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Longueur linéaire (cm)</label>
              <input
                type="number"
                className="input"
                value={form.shelfLengthCm}
                onChange={(e) => set("shelfLengthCm", e.target.value)}
              />
            </div>
            <div>
              <label className="label">Position rayon</label>
              <select
                className="input"
                value={form.shelfPosition}
                onChange={(e) =>
                  set(
                    "shelfPosition",
                    e.target.value as MerchAudit["shelfPosition"],
                  )
                }
              >
                {POSITIONS.map((p) => (
                  <option key={p.v} value={p.v}>
                    {p.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.outOfStock}
                  onChange={(e) => set("outOfStock", e.target.checked)}
                />
                Rupture
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.plvPresent}
                  onChange={(e) => set("plvPresent", e.target.checked)}
                />
                PLV présente
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.activationPresent}
                  onChange={(e) => set("activationPresent", e.target.checked)}
                />
                Activation
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Photo avant</label>
              <PhotoInput
                value={form.photoBefore}
                onChange={(v) => set("photoBefore", v)}
                label="Photo avant"
              />
            </div>
            <div>
              <label className="label">Photo après</label>
              <PhotoInput
                value={form.photoAfter}
                onChange={(v) => set("photoAfter", v)}
                label="Photo après"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className="btn-primary" onClick={submit}>
              Enregistrer
            </button>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Part de linéaire par marque
          </h3>
          <div className="space-y-3">
            {shelf.map((s, i) => (
              <div key={s.brand}>
                <div className="mb-1 flex justify-between text-xs text-slate-600">
                  <span>{s.brand}</span>
                  <span className="font-semibold">
                    {Math.round(s.share * 100)}% · {s.facings} facings
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.round(s.share * 100)}%`,
                      backgroundColor: PIE[i % PIE.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Derniers relevés
          </h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {list.slice(0, 25).map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {m.brand}{" "}
                    <span className="text-xs text-slate-400">
                      · {m.facings} facings
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {m.outlet} · {m.region} · {formatDate(m.createdAt)}
                    {m.outOfStock && " · Rupture"}
                    {m.plvPresent && " · PLV"}
                  </div>
                </div>
                <SyncBadge status={m.syncStatus} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
