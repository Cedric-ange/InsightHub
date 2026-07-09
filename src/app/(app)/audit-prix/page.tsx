"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Tags, CheckCircle2 } from "lucide-react";
import { getDB } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { useSync } from "@/lib/sync";
import { getCurrentPosition } from "@/lib/geo";
import { PageHeader, StatCard, Card, SyncBadge } from "@/components/ui";
import { PhotoInput } from "@/components/forms/PhotoInput";
import { priceByBrand, computeKPIs } from "@/lib/analytics";
import { uid, formatFCFA, formatDate, cn } from "@/lib/utils";
import type { PriceAudit } from "@/lib/types";

const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque", "Boutique"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"];
const REGIONS = ["Abidjan", "Bouaké", "San Pedro"];

export default function AuditPrixPage() {
  const user = useAuth((s) => s.user);
  const { online, flush, refreshPending } = useSync();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);

  const audits = useLiveQuery(
    () => getDB().priceAudits.orderBy("createdAt").reverse().toArray(),
    [],
  );

  const [form, setForm] = useState({
    outlet: OUTLETS[0],
    channel: CHANNELS[1],
    isOwnBrand: true,
    brand: "Notre marque",
    product: "",
    price: "",
    indigoWidth: "0%", // Géré proprement sans inline-style brut
    promo: false,
    available: true,
    facings: "",
    region: REGIONS[0],
    photo: null as string | null,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.product.trim() || form.price === "") return;
    const geo = await getCurrentPosition();
    const rec: PriceAudit = {
      id: uid("pa"),
      outlet: form.outlet,
      channel: form.channel,
      brand: form.isOwnBrand ? "Notre marque" : form.brand.trim() || "Concurrent",
      isOwnBrand: form.isOwnBrand,
      product: form.product.trim(),
      price: Number(form.price),
      promo: form.promo,
      available: form.available,
      facings: form.facings ? Number(form.facings) : undefined,
      region: form.region,
      photo: form.photo ?? undefined,
      geo: geo ?? undefined,
      agentId: user?.id ?? "unknown",
      agentName: user?.name ?? "Enquêteur",
      syncStatus: "pending",
      createdAt: Date.now(),
    };
    await getDB().priceAudits.add(rec);
    await refreshPending();
    if (online) flush().catch(() => undefined);
    setForm((f) => ({ ...f, product: "", price: "", facings: "", photo: null }));
    setOpen(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 2500);
  };

  const list = audits ?? [];
  const kpis = computeKPIs([], list, []);
  const brands = priceByBrand(list);

  return (
    <div>
      <PageHeader
        title="Audit Prix"
        subtitle="Contrôlez nos prix, ceux de la concurrence et les promotions. Photo obligatoire."
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
          label="Notre prix moyen"
          value={formatFCFA(kpis.avgOwnPrice)}
          icon={<Tags size={18} />}
          tone="brand"
        />
        <StatCard
          label="Indice prix"
          value={Math.round(kpis.priceIndex)}
          hint="Base concurrence = 100"
          tone={kpis.priceIndex > 108 ? "amber" : "green"}
        />
        <StatCard
          label="Disponibilité"
          value={`${Math.round(kpis.availabilityRate * 100)}%`}
          tone={kpis.availabilityRate < 0.8 ? "red" : "green"}
        />
        <StatCard label="Relevés" value={list.length} tone="slate" />
      </div>

      {open && (
        <Card className="mt-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Nouveau relevé de prix</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            
            {/* 1. Point de vente */}
            <div>
              <label htmlFor="outlet-select" className="label">Point de vente</label>
              <select
                id="outlet-select"
                title="Sélectionner le point de vente"
                className="input"
                value={form.outlet}
                onChange={(e) => set("outlet", e.target.value)}
              >
                {OUTLETS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* 2. Canal */}
            <div>
              <label htmlFor="channel-select" className="label">Canal</label>
              <select
                id="channel-select"
                title="Sélectionner le canal de distribution"
                className="input"
                value={form.channel}
                onChange={(e) => set("channel", e.target.value)}
              >
                {CHANNELS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* 3. Marque */}
            <div>
              <span className="label block mb-2">Marque</span>
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
                  id="brand-input"
                  title="Nom du concurrent"
                  className="input mt-2"
                  placeholder="Nom du concurrent"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                />
              )}
            </div>

            {/* 4. Région */}
            <div>
              <label htmlFor="region-select" className="label">Région</label>
              <select
                id="region-select"
                title="Sélectionner la région de l'audit"
                className="input"
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
              >
                {REGIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* 5. Produit */}
            <div>
              <label htmlFor="product-input" className="label">Produit *</label>
              <input
                id="product-input"
                title="Saisir le libellé du produit"
                className="input"
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
                placeholder="Ex : Bonnet rouge 16g"
              />
            </div>

            {/* 6. Prix observé */}
            <div>
              <label htmlFor="price-input" className="label">Prix observé (FCFA) *</label>
              <input
                id="price-input"
                title="Prix observé en FCFA"
                type="number"
                className="input"
                placeholder="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>

            {/* 7. Facings observés */}
            <div>
              <label htmlFor="facings-input" className="label">Facings observés</label>
              <input
                id="facings-input"
                title="Nombre de facings visibles sur le rayon"
                type="number"
                className="input"
                placeholder="0"
                value={form.facings}
                onChange={(e) => set("facings", e.target.value)}
              />
            </div>

            {/* 8. Options Checkbox */}
            <div className="flex items-end gap-4 h-[42px] mb-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  title="Produit en promotion"
                  type="checkbox"
                  checked={form.promo}
                  onChange={(e) => set("promo", e.target.checked)}
                />
                Promotion
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  title="Produit disponible en rayon"
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => set("available", e.target.checked)}
                />
                Disponible
              </label>
            </div>
          </div>

          <div>
            <span className="label block mb-1">Photo</span>
            <PhotoInput
              value={form.photo}
              onChange={(v) => set("photo", v)}
              label="Photo du rayon / prix"
            />
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
            Indice de prix par marque
          </h3>
          <div className="space-y-3">
            {brands.map((b) => {
              const widthPct = `${Math.min(100, b.index / 1.5)}%`;
              return (
                <div key={b.brand} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm text-slate-600">
                    {b.brand}
                  </span>
                  <div className="h-2.5 flex-1 rounded-full bg-slate-100">
                    {/* Correction : Remplacement des styles arbitraires en ligne par des variables CSS pour Tailwind */}
                    <div
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-500",
                        b.isOwn ? "bg-brand-600" : "bg-slate-400",
                      )}
                      style={{ width: widthPct }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs text-slate-500">
                    {formatFCFA(b.avgPrice)}
                  </span>
                  <span className="w-10 text-right text-xs font-semibold text-slate-700">
                    {Math.round(b.index)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Derniers relevés
          </h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {list.slice(0, 25).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {a.product}{" "}
                    <span className="text-xs text-slate-400">· {a.brand}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.outlet} · {a.region} · {formatDate(a.createdAt)}
                    {a.promo && " · Promo"}
                    {!a.available && " · Rupture"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">
                    {formatFCFA(a.price)}
                  </div>
                  <SyncBadge status={a.syncStatus} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}