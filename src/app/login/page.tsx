"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS, useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";
import { LogIn, ChevronRight } from "lucide-react";

// Intégration directe de votre logo d'application officiel avec son contour blanc
function LogoApp({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg 
      className={className}
      version="1.0" 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#D32F2F" stroke="#FFFFFF" strokeWidth="20" strokeLinejoin="round">
        <path d="M0 2560 l0 -2560 2560 0 2560 0 0 2560 0 2560 -2560 0 -2560 0 0 -2560z m2858 1746 c262 -66 468 -187 664 -394 376 -396 475 -957 267 -1502 -155 -405 -525 -907 -1051 -1428 -112 -110 -150 -142 -171 -142 -36 0 -143 97 -359 327 -337 359 -538 618 -713 916 -243 416 -322 821 -234 1202 119 512 542 930 1044 1029 125 24 131 25 295 21 125 -3 175 -9 258 -29z"/>
        <path d="M2455 3990 c-223 -25 -416 -115 -582 -274 -148 -141 -240 -295 -296 -494 -18 -65 -21 -104 -21 -257 0 -163 3 -189 27 -278 73 -270 246 -513 469 -657 329 -213 712 -209 1039 10 94 63 244 221 308 324 60 97 110 213 143 333 19 66 22 105 22 263 1 164 -2 195 -22 270 -66 242 -222 459 -426 595 -147 98 -282 146 -456 165 -104 11 -105 11 -205 0z m799 -552 c14 -20 16 -95 16 -619 l0 -596 -77 -62 c-73 -59 -245 -152 -305 -167 l-28 -6 0 718 c0 654 1 719 17 736 14 16 34 18 189 18 167 0 173 -1 188 -22z m-506 -440 c9 -9 12 -139 12 -524 l0 -512 -77 -7 c-87 -9 -203 -2 -280 16 l-53 12 0 498 c0 439 2 499 16 513 13 13 45 16 193 16 124 0 181 -4 189 -12z m-508 -353 c10 -12 14 -91 15 -315 2 -165 -1 -302 -5 -305 -12 -7 -148 65 -212 111 -29 21 -83 67 -120 103 l-68 64 0 159 c0 91 4 168 10 179 10 18 23 19 189 19 148 0 181 -3 191 -15z"/>
      </g>
    </svg>
  );
}

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
    if (res.ok) router.replace("/dashboard");
    else setError(res.error ?? "Identifiants incorrects.");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel (FrieslandCampina & Bonnet Rouge) */}
      <div className="hidden flex-col justify-between bg-brand-900 p-10 text-white lg:flex border-r border-brand-950">
        <div className="flex items-center gap-3">
          <LogoApp className="h-12 w-12" />
          <div>
            <div className="text-xl font-bold tracking-wide">InsightHub</div>
            <div className="text-xs text-brand-200 uppercase tracking-widest font-semibold">Field Intelligence Platform</div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Votre Nielsen / Kantar interne.
          </h2>
          <p className="mt-4 max-w-md text-brand-100 text-sm leading-relaxed">
            Collecte terrain digitale offline, audit prix, merchandising et
            analytics automatisées — directement reliés à l&apos;IBP et au modèle
            6P pour les marques de <strong>FrieslandCampina</strong>.
          </p>
          
          <ul className="mt-8 space-y-3 text-sm text-brand-200 bg-brand-950/40 p-4 rounded-xl border border-brand-800/50">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Collecte → Contrôle Qualité → Analyse → Insights → Décision
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Fonctionne hors-ligne, resynchronise automatiquement sur le terrain
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Reporting en temps réel pour Marketing, Sales, Trade & Direction
            </li>
          </ul>
        </div>

        <div className="text-xs text-brand-300">
          © {new Date().getFullYear()} InsightHub · Pilote Côte d&apos;Ivoire
        </div>
      </div>

      {/* Login form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <LogoApp className="h-10 w-10" />
              <div>
                <div className="text-lg font-bold text-slate-900">InsightHub</div>
                <div className="text-xs text-slate-400 font-medium">FrieslandCampina</div>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accédez à la plateforme de renseignement commercial.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 tracking-wide">Email Corporate</label>
              <input
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="toure.cedric@frieslandcampina.com"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 tracking-wide">Mot de passe</label>
              <input
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm rounded-lg shadow-md shadow-accent-500/20 active:scale-[0.99] transition-all"
            >
              <LogIn size={16} /> Se connecter
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Connexion rapide (Profils terrain démo)
            </p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    loginAs(acc);
                    router.replace("/dashboard");
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm hover:border-brand-300 hover:bg-brand-50/50 transition-all group"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-slate-700 truncate group-hover:text-brand-600 transition-colors">{acc.name}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{acc.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
                      {ROLE_LABELS[acc.role] || acc.role}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
              Prêt pour l&apos;authentification unique fédérée via <strong>Microsoft Entra ID</strong> en production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}