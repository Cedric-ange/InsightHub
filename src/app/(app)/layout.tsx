"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { canAccess, landingPath, useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";
import { useSync } from "@/lib/sync"; // ⚡ Import du moteur de synchronisation

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Récupération des actions du store de synchronisation
  const { flush, pullStudiesFromCloud, refreshPending } = useSync();

  // 🔄 BOUCLE DE SYNCHRONISATION AUTOMATIQUE & PÉRIODIQUE (Toutes les 30 secondes)
  useEffect(() => {
    if (!user) return;

    // 1. Chargement et vérification initiale immédiate
    refreshPending();
    if (user.role !== "FIELD_AGENT") {
      pullStudiesFromCloud();
    }

    // 2. Initialisation de la routine d'arrière-plan avec Supabase
    const interval = setInterval(async () => {
      console.log("🔄 Synchronisation périodique automatique avec Supabase...");
      
      // Pousse les données collectées localement si nécessaire
      await flush(user.role);
      
      // Si c'est un profil décisionnaire, on actualise le catalogue de formulaires
      if (user.role !== "FIELD_AGENT") {
        await pullStudiesFromCloud();
      }
    }, 30000); // 30000 ms = 30 secondes

    return () => clearInterval(interval);
  }, [user, flush, pullStudiesFromCloud, refreshPending]);

  // Auth guard + per-area role guard (client-side; auth is persisted locally).
  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    const nav = NAV_ITEMS.find(
      (n) => pathname === n.href || pathname.startsWith(n.href + "/"),
    );
    if (nav && !canAccess(user.role, nav.area)) {
      router.replace(landingPath(user.role));
      return;
    }
    setReady(true);
  }, [user, pathname, router]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!user || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="fixed inset-y-0 w-[260px]">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[260px]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className={cn("flex min-h-screen flex-col")}>
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}