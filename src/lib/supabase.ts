"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side persistence for synced field data. The client is only created
// when both env vars are present; otherwise the app stays fully offline-first
// and flush() falls back to a local-only no-op.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(url!, key!, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
