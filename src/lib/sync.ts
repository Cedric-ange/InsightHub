"use client";

import { create } from "zustand";
import { getDB } from "./db";
import type { MerchAudit, PriceAudit, Submission } from "./types";

// Envoi d'un lot d'enregistrements locaux vers la route d'API backend
async function pushBatch<T extends { id: string }>(
  table: string,
  records: T[],
  toRow: (r: T) => Record<string, unknown>,
): Promise<void> {
  const rows = records.map(toRow);

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      table,
      records: rows,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`Erreur Synchro [${table}]: ${errData.error || response.statusText}`);
  }
}

const submissionRow = (s: Submission) => ({
  id: s.id,
  study_id: s.studyId,
  study_title: s.studyTitle,
  agent_id: s.agentId,
  agent_name: s.agentName,
  answers: s.answers,
  geo: s.geo ?? null,
  started_at: s.startedAt,
  finished_at: s.finishedAt,
  duration_sec: s.durationSec,
  validation: s.validation,
  created_at: s.createdAt,
});

const priceAuditRow = (p: PriceAudit) => ({
  id: p.id,
  outlet: p.outlet,
  channel: p.channel,
  brand: p.brand,
  is_own_brand: p.isOwnBrand,
  product: p.product,
  price: p.price,
  promo: p.promo,
  available: p.available,
  facings: p.facings ?? null,
  region: p.region ?? null,
  geo: p.geo ?? null,
  agent_id: p.agentId,
  agent_name: p.agentName,
  created_at: p.createdAt,
});

const merchAuditRow = (m: MerchAudit) => ({
  id: m.id,
  outlet: m.outlet,
  channel: m.channel,
  brand: m.brand,
  is_own_brand: m.isOwnBrand,
  facings: m.facings,
  shelf_length_cm: m.shelfLengthCm,
  shelf_position: m.shelfPosition,
  out_of_stock: m.outOfStock,
  plv_present: m.plvPresent,
  activation_present: m.activationPresent,
  region: m.region ?? null,
  geo: m.geo ?? null,
  agent_id: m.agentId,
  agent_name: m.agentName,
  created_at: m.createdAt,
});

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
  pullStudiesFromCloud: () => Promise<void>; // ⚡ NOUVEAUTÉ : Récupération forcée de Supabase
  flush: (userRole?: string) => Promise<void>;
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

// ⚡ RÉCUPÉRATION DIRECTE DE TES QUESTIONNAIRES DEPUIS SUPABASE CLOUD
  pullStudiesFromCloud: async () => {
    if (!get().online) return;
    try {
      const response = await fetch(`/api/seed?_t=${Date.now()}`); 
      if (response.ok) {
        // La route de seed met à jour Supabase et IndexedDB via le cloud
        console.log("Catalogue mis à jour avec succès depuis Supabase.");
      }
    } catch (e) {
      console.error("Impossible de rafraîchir le catalogue cloud", e);
    }
  },

  flush: async (userRole?: string) => {
    if (get().syncing || !get().online) return;
    set({ syncing: true });
    const db = getDB();
    try {
      // Si l'utilisateur connecté n'est PAS un agent de test terrain (FIELD_AGENT),
      // on peut bloquer l'envoi de lignes mockées locales non sollicitées
      const isTestUser = userRole === "FIELD_AGENT";

      const subs = await db.submissions.where("syncStatus").equals("pending").toArray();
      if (subs.length && (isTestUser || subs[0].agentId !== "agent_terrain_02")) {
        await pushBatch("submissions", subs, submissionRow);
        await db.submissions.bulkUpdate(
          subs.map((s) => ({ key: s.id, changes: { syncStatus: "synced" } })),
        );
      }
      
      const pa = await db.priceAudits.where("syncStatus").equals("pending").toArray();
      if (pa.length) {
        await pushBatch("price_audits", pa, priceAuditRow);
        await db.priceAudits.bulkUpdate(
          pa.map((p) => ({ key: p.id, changes: { syncStatus: "synced" } })),
        );
      }
      
      const ma = await db.merchAudits.where("syncStatus").equals("pending").toArray();
      if (ma.length) {
        await pushBatch("merch_audits", ma, merchAuditRow);
        await db.merchAudits.bulkUpdate(
          ma.map((m) => ({ key: m.id, changes: { syncStatus: "synced" } })),
        );
      }
      set({ lastSyncAt: Date.now() });
    } finally {
      set({ syncing: false });
      await get().refreshPending();
    }
  },
}));