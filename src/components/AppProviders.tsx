"use client";

import { useEffect } from "react";
import { useSync } from "@/lib/sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setOnline = useSync((s) => s.setOnline);
  const refreshPending = useSync((s) => s.refreshPending);
  const flush = useSync((s) => s.flush);
  const pullStudiesFromCloud = useSync((s) => s.pullStudiesFromCloud);

  useEffect(() => {
    // Register the service worker for offline shell caching.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    // Hydratation initiale : le catalogue de questionnaires provient du backend
    // (aucune donnée mockée locale) et alimente le cache IndexedDB hors-ligne.
    pullStudiesFromCloud().catch(() => undefined);
    refreshPending().catch(() => undefined);

    // Resynchronisation automatique au retour de la connexion réseau.
    const goOnline = () => {
      setOnline(true);
      flush().catch(() => undefined);
      pullStudiesFromCloud().catch(() => undefined);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline, refreshPending, flush, pullStudiesFromCloud]);

  return <>{children}</>;
}
