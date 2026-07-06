"use client";

import { create } from "zustand";
import { getDB } from "./db";

// Offline sync engine. Field data is written locally with syncStatus="pending".
// When the network is available, flush() replays each pending record to the
// backend API (simulated here) and flips it to "synced" — the KoboCollect model.

async function fakeUpload(): Promise<void> {
  // Placeholder for the future REST call, e.g.:
  //   await fetch("/api/sync", { method: "POST", body: JSON.stringify(record) })
  await new Promise((r) => setTimeout(r, 120));
}

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

  setOnline: (v) => set({ online: v }),

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
    if (get().syncing || !get().online) return;
    set({ syncing: true });
    const db = getDB();
    try {
      const subs = await db.submissions.where("syncStatus").equals("pending").toArray();
      for (const s of subs) {
        await fakeUpload();
        await db.submissions.update(s.id, { syncStatus: "synced" });
      }
      const pa = await db.priceAudits.where("syncStatus").equals("pending").toArray();
      for (const p of pa) {
        await fakeUpload();
        await db.priceAudits.update(p.id, { syncStatus: "synced" });
      }
      const ma = await db.merchAudits.where("syncStatus").equals("pending").toArray();
      for (const m of ma) {
        await fakeUpload();
        await db.merchAudits.update(m.id, { syncStatus: "synced" });
      }
      set({ lastSyncAt: Date.now() });
    } finally {
      set({ syncing: false });
      await get().refreshPending();
    }
  },
}));
