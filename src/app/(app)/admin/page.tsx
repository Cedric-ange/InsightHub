"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { UserPlus, Trash2, ShieldCheck, KeyRound } from "lucide-react";
import { getDB } from "@/lib/db";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { ROLE_LABELS, type Role, type User } from "@/lib/types";
import { uid, formatDate, cn } from "@/lib/utils";

const ROLES = Object.keys(ROLE_LABELS) as Role[];
const REGIONS = ["Abidjan", "Bouaké", "San Pedro", "Yamoussoukro"];

const ROLE_STYLE: Record<Role, string> = {
  ADMIN: "bg-brand-100 text-brand-800",
  MANAGER: "bg-violet-100 text-violet-800",
  ANALYST: "bg-emerald-100 text-emerald-800",
  SUPERVISOR: "bg-amber-100 text-amber-800",
  FIELD_AGENT: "bg-slate-100 text-slate-700",
};

export default function AdminPage() {
  const users = useLiveQuery(() => getDB().users.toArray(), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "FIELD_AGENT" as Role,
    region: REGIONS[0],
  });
  const [error, setError] = useState<string | null>(null);

  const addUser = async () => {
    setError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setError("Nom et email sont obligatoires.");
      return;
    }
    const user: User = {
      id: uid("u"),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      region: form.region,
      active: true,
      createdAt: Date.now(),
    };
    await getDB().users.add(user);
    setForm({ name: "", email: "", role: "FIELD_AGENT", region: REGIONS[0] });
    setOpen(false);
  };

  const toggleActive = (u: User) =>
    getDB().users.update(u.id, { active: !u.active });
  const changeRole = (u: User, role: Role) =>
    getDB().users.update(u.id, { role });
  const remove = (id: string) => {
    if (confirm("Supprimer cet utilisateur ?")) getDB().users.delete(id);
  };

  return (
    <div>
      <PageHeader
        title="Administration"
        subtitle="Gestion des utilisateurs, rôles et permissions."
        action={
          <button className="btn-primary" onClick={() => setOpen((o) => !o)}>
            <UserPlus size={16} /> Nouvel utilisateur
          </button>
        }
      />

      {open && (
        <Card className="mb-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Créer un utilisateur</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nom complet *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Rôle</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value as Role })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Région</label>
              <select
                className="input"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button className="btn-primary" onClick={addUser}>
              Créer
            </button>
          </div>
        </Card>
      )}

      {!users ? (
        <p className="text-slate-400">Chargement…</p>
      ) : users.length === 0 ? (
        <EmptyState title="Aucun utilisateur" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="hidden px-4 py-3 sm:table-cell">Région</th>
                <th className="hidden px-4 py-3 md:table-cell">Créé le</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as Role)}
                      className={cn(
                        "rounded-full border-0 px-2.5 py-1 text-xs font-medium",
                        ROLE_STYLE[u.role],
                      )}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                    {u.region ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u)}
                      className={cn(
                        "badge",
                        u.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {u.active ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
                        title="Réinitialiser le mot de passe"
                        onClick={() =>
                          alert(
                            `Un lien de réinitialisation serait envoyé à ${u.email}.`,
                          )
                        }
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        className="rounded p-1.5 text-red-400 hover:bg-red-50"
                        onClick={() => remove(u.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Card className="mt-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ShieldCheck size={16} /> Matrice des permissions (rôles)
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r) => (
            <div key={r} className="rounded-lg border border-slate-100 p-3">
              <div className={cn("badge mb-2", ROLE_STYLE[r])}>
                {ROLE_LABELS[r]}
              </div>
              <p className="text-xs text-slate-500">
                {r === "ADMIN" && "Accès total : administration, études, dashboards, collecte."}
                {r === "MANAGER" && "Pilotage : dashboards, études, validation, analytics."}
                {r === "ANALYST" && "Conception d'études, dashboards et insights."}
                {r === "SUPERVISOR" && "Validation terrain, collecte, dashboards."}
                {r === "FIELD_AGENT" && "Collecte terrain, audit prix, merchandising."}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
