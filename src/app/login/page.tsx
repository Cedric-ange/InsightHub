"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS, landingPath, useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { LogIn, ChevronRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const loginAs = useAuth((s) => s.loginAs);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) {
      const { user } = useAuth.getState();
      router.replace(landingPath(user?.role));
    } else setError(res.error ?? "Erreur");
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              <LogIn size={16} /> Se connecter
            </button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Connexion rapide (démo)
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    loginAs(acc);
                    router.replace(landingPath(acc.role));
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-medium text-slate-800">{acc.name}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {ROLE_LABELS[acc.role]}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Mot de passe pour tous les comptes : <code>demo</code>. Prêt à
              basculer vers Microsoft Entra ID (MFA) en production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
