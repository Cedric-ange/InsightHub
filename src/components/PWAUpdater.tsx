"use client";

import { useEffect } from "react";

export function PWAUpdater() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const sw = navigator.serviceWorker;

      // 1. Détecter si un nouveau Service Worker (nouvelle version Vercel) est en attente
      sw.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // 2. Forcer la vérification de mise à jour à chaque fois que l'utilisateur ouvre l'app
      sw.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);

  return null;
}