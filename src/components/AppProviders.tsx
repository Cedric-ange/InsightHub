"use client";

import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/seed";
import { useSync } from "@/lib/sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setOnline = useSync((s) => s.setOnline);
  const refreshPending = useSync((s) => s.refreshPending);
  const flush = useSync((s) => s.flush);

  useEffect(() => {
    // Register the service worker for offline shell caching.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    // Seed the local IndexedDB store on first launch.
    seedIfEmpty()
      .then(() => refreshPending())
      .catch(() => undefined);

    const goOnline = () => {
      setOnline(true);
      flush().catch(() => undefined);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [setOnline, refreshPending, flush]);

  return <>{children}</>;
}
