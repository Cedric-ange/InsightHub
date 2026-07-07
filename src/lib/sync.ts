"use client";

import { create } from "zustand";
import { getDB } from "./db";
import { getSupabase } from "./supabase";
import type { MerchAudit, PriceAudit, Submission } from "./types";

// Offline sync engine. Field data is written locally with syncStatus="pending".
// When the network is available, flush() replays each pending record to
// Supabase (when configured) and flips it to "synced" — the KoboCollect model.
// Without Supabase env vars, records stay local-only (offline-first fallback).

async function localOnlyDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, 120));
}

// Upsert a batch of local records into a Supabase table. `toRow` flattens each
// record into a column-friendly row keyed by the record id.
async function pushBatch<T extends { id: string }>(
  table: string,
  records: T[],
  toRow: (r: T) => Record<string, unknown>,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    await localOnlyDelay();
    return;
  }
  const { error } = await supabase
    .from(table)
    .upsert(records.map(toRow), { onConflict: "id" });
  if (error) throw new Error(`Supabase ${table}: ${error.message}`);
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
      if (subs.length) {
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
