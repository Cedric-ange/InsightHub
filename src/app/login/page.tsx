"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { landingPath, useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { LogIn, ChevronRight, Loader2 } from "lucide-react";

// On duplique proprement la liste avec les vrais emails et mots de passe du Seed pour les boutons
const REAL_DEVICES_ACCOUNTS = [
  { name: "Cédric Touré", email: "cedric.toure@insighthub.ci", password: "FC_Admin_Abidjan2026!", role: "admin" },
  { name: "Patrick Epée", email: "patrick.epee@insighthub.ci", password: "FC_Manager_Epee2026*", role: "manager" },
  { name: "Dian Delaure", email: "dian.delaure@insighthub.ci", password: "FC_Analyst_Delaure!", role: "analyst" },
  { name: "Marie Jeanne", email: "marie.jeanne@insighthub.ci", password: "FC_Super_Marie2026", role: "supervisor" },
  { name: "Dogo Jean-Marc", email: "jean-marc.dogo@insighthub.ci", password: "FC_Field_Dogo2026", role: "field" }
];

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuth((s) => s.loginAs); // Utilise le store Zustand pour stocker l'utilisateur connecté
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fonction principale de connexion via l'API Backend
  const handleLogin = async (targetEmail: string, targetPass: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Identifiants invalides");
      }

      // Si le backend valide, on synchronise l'état global frontend (Zustand)
      setSession(data.user);
      router.replace(landingPath(data.user.role));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue lors de la connexion.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-brand-950 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold">
            IH
          </div>
          <div>
            <div className="text-lg font-bold">InsightHub</div>
            <div className="text-sm text-brand-200">Field Intelligence Platform</div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Votre Nielsen / Kantar interne.
          </h2>
          <p className="mt-4 max-w-md text-brand-200">
            Collecte terrain digitale offline, audit prix, merchandising et
            analytics automatisées — directement reliés à l&apos;IBP et au modèle
            6P.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-brand-100">
            <li>• Collecte → Contrôle Qualité → Analyse → Insights → Décision</li>
            <li>• Fonctionne sans internet, resynchronise automatiquement</li>
            <li>• Reporting temps réel pour Marketing, Sales, Trade & Direction</li>
          </ul>
        </div>
        <div className="text-xs text-brand-300">
          © {new Date().getFullYear()} InsightHub · Pilote Côte d&apos;Ivoire
        </div>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
                IH
              </div>
              <div className="text-lg font-bold text-slate-900">InsightHub</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accédez à la plateforme Field Intelligence.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adresse mail"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input
                className="input"
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Se connecter
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Simulation Session Réelle (RH)
            </p>
            <div className="space-y-2">
              {REAL_DEVICES_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    handleLogin(acc.email, acc.password);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-medium text-slate-800">{acc.name}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {ROLE_LABELS[acc.role as keyof typeof ROLE_LABELS] || acc.role}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Chaque clic interroge dynamiquement la table <code>users</code> de Supabase Cloud avec son mot de passe unique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}