"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { canAccess, landingPath, useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";
import { useSync } from "@/lib/sync";
import { useSidebarStore } from "@/lib/sidebarStore"; // ⚡ Import du store

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const isCollapsed = useSidebarStore((s) => s.isCollapsed); // ⚡ Écoute de l'état réduit
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const { flush, pullStudiesFromCloud, refreshPending } = useSync();

  useEffect(() => {
    if (!user) return;
    refreshPending();
    if (user.role !== "FIELD_AGENT") {
      pullStudiesFromCloud();
    }

    const interval = setInterval(async () => {
      await flush(user.role);
      if (user.role !== "FIELD_AGENT") {
        await pullStudiesFromCloud();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, flush, pullStudiesFromCloud, refreshPending]);

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
    <div 
      className={cn(
        "min-h-screen transition-[grid-template-columns] duration-300 ease-in-out lg:grid",
        isCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]" // ⚡ Ajustement dynamique de l'espace
      )}
    >
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className={cn("fixed inset-y-0 transition-[width] duration-300 ease-in-out", isCollapsed ? "w-[76px]" : "w-[260px]")}>
          <Sidebar />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}