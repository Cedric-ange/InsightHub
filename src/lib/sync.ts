"use client";

import { create } from "zustand";
import { getDB } from "./db";

export interface PendingCounts {
  submissions: number;
  priceAudits: number;
  merchAudits: number;
  total: number;
}

interface SyncState {
  online: boolean;
  syncing: boolean;
  lastSyncAt: number | null;
  pending: PendingCounts;
  setOnline: (v: boolean) => void;
  refreshPending: () => Promise<void>;
  flush: () => Promise<void>;
}

export const useSync = create<SyncState>((set, get) => ({
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncing: false,
  lastSyncAt: null,
  pending: { submissions: 0, priceAudits: 0, merchAudits: 0, total: 0 },

  setOnline: (v) => {
    set({ online: v });
    // Si l'application repasse en ligne, on déclenche automatiquement la synchronisation
    if (v) {
      get().flush();
    }
  },

  refreshPending: async () => {
    const db = getDB();
    const [submissions, priceAudits, merchAudits] = await Promise.all([
      db.submissions.where("syncStatus").equals("pending").count(),
      db.priceAudits.where("syncStatus").equals("pending").count(),
      db.merchAudits.where("syncStatus").equals("pending").count(),
    ]);
    set({
      pending: {
        submissions,
        priceAudits,
        merchAudits,
        total: submissions + priceAudits + merchAudits,
      },
    });
  },

  flush: async () => {
    // Empêche une double synchronisation ou une synchronisation hors ligne
    if (get().syncing || !get().online) return;
    
    const db = getDB();
    
    // Récupération de tous les éléments en attente d'envoi
    const [subs, pa, ma] = await Promise.all([
      db.submissions.where("syncStatus").equals("pending").toArray(),
      db.priceAudits.where("syncStatus").equals("pending").toArray(),
      db.merchAudits.where("syncStatus").equals("pending").toArray(),
    ]);

    // S'il n'y a rien à synchroniser, on s'arrête là
    if (subs.length === 0 && pa.length === 0 && ma.length === 0) return;

    set({ syncing: true });

    try {
      // Appel de l'API REST de synchronisation sur Vercel
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissions: subs,
          priceAudits: pa,
          merchAudits: ma,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la réponse du serveur d'API");
      }

      const result = await response.json();

      if (result.success) {
        // Validation locale dans Dexie : on passe le statut à "synced" pour tous les éléments envoyés
        await Promise.all([
          db.submissions.where("syncStatus").equals("pending").modify({ syncStatus: "synced" }),
          db.priceAudits.where("syncStatus").equals("pending").modify({ syncStatus: "synced" }),
          db.merchAudits.where("syncStatus").equals("pending").modify({ syncStatus: "synced" }),
        ]);
        
        set({ lastSyncAt: Date.now() });
      } else {
        throw new Error(result.error || "Échec de la synchronisation");
      }
    } catch (error) {
      console.error("Moteur de synchronisation hors-ligne :", error);
      // Optionnel : Vous pouvez modifier le statut local en "error" ici si nécessaire
    } finally {
      set({ syncing: false });
      // Mise à jour des compteurs visuels sur l'interface
      await get().refreshPending();
    }
  },
}));

// Écouteurs d'événements réseau natifs du navigateur pour piloter automatiquement le store
if (typeof window !== "undefined") {
  window.addEventListener("online", () => useSync.getState().setOnline(true));
  window.addEventListener("offline", () => useSync.getState().setOnline(false));
}