"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccess, useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Map, 
  DollarSign, 
  Store, 
  BarChart3, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert 
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "studies", label: "Questionnaires", href: "/studies", icon: ClipboardList },
  { id: "collect", label: "Collecte terrain", href: "/collect", icon: Map },
  { id: "audit-prix", label: "Audit Prix", href: "/audit-prix", icon: DollarSign },
  { id: "merchandising", label: "Merchandising", href: "/merchandising", icon: Store },
  { id: "analytics", label: "Analytics & Insights", href: "/analytics", icon: BarChart3 },
  { id: "validation", label: "Validation", href: "/validation", icon: CheckCircle2 },
  { id: "sync", label: "Synchronisation", href: "/sync", icon: RefreshCw },
  { id: "admin", label: "Administration", href: "/admin", icon: ShieldAlert },
];

// 1. Définition du type pour accepter onNavigate
interface SidebarProps {
  onNavigate?: () => void;
}

// 2. Injection des Props dans le composant
export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);

  return (
    <aside className="w-64 bg-slate-950 text-slate-400 flex flex-col h-screen border-r border-slate-900 flex-shrink-0 select-none">
      
      {/* En-tête de marque complet : Logo Rouge à contour blanc + Titre */}
      <div className="p-5 border-b border-slate-900 flex items-center gap-3 bg-slate-950/80">
        <svg 
          className="h-9 w-9 flex-shrink-0"
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
        <div>
          <div className="text-base font-bold text-slate-100 tracking-wide">InsightHub</div>
          <div className="text-[10px] text-brand-300 font-semibold uppercase tracking-wider">FrieslandCampina</div>
        </div>
      </div>

      {/* Identité de l'utilisateur connecté */}
      <div className="px-4 py-3 bg-slate-950/20 border-b border-slate-900 flex items-center gap-2.5 text-xs">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
        <span className="text-slate-400 truncate">
          Session : <strong className="text-slate-200 font-medium">{user?.name || "Agent"}</strong>
        </span>
      </div>

      {/* Liste des onglets de navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (!canAccess(user?.role, item.id)) return null;

          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              // 3. Déclenchement de la fermeture du menu mobile lors du clic
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/10 font-semibold" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
              }`}
            >
              {/* Liseré rouge d'accentuation Bonnet Rouge pour l'onglet actif */}
              {isActive && (
                <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-accent-500" />
              )}

              <Icon 
                size={18} 
                className={`transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                }`} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Versioning discret en bas */}
      <div className="p-4 border-t border-slate-900 text-[10px] text-slate-600 font-medium tracking-wider uppercase">
        FIP · v0.1 · FrieslandCampina
      </div>
    </aside>
  );
}