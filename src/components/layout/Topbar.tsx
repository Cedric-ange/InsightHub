"use client";

import { useRouter } from "next/navigation";
import { Menu, Wifi, WifiOff, RefreshCw, LogOut, CloudUpload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSync } from "@/lib/sync";
import { ROLE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { online, syncing, pending, flush } = useSync();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <button
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        onClick={onMenu}
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

      <div
        className={cn(
          "badge gap-1.5",
          online ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700",
        )}
      >
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online ? "En ligne" : "Hors ligne"}
      </div>

      {pending.total > 0 && (
        <button
          onClick={() => flush()}
          disabled={!online || syncing}
          className="badge gap-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-60"
          title="Synchroniser les données locales"
        >
          {syncing ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <CloudUpload size={13} />
          )}
          {pending.total} à synchroniser
        </button>
      )}

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold text-slate-800">{user.name}</div>
            <div className="text-[11px] text-slate-500">
              {ROLE_LABELS[user.role]}
              {user.region ? ` · ${user.region}` : ""}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
          title="Se déconnecter"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
