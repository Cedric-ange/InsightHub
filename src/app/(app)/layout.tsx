"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { canAccess, landingPath, useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/components/layout/nav";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

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
