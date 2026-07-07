import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Variables Supabase manquantes côté serveur." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const body = await request.json();
    const { table, records } = body;

    if (!table || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Format de requête invalide." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from(table)
      .upsert(records, { onConflict: "id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: records.length });
    } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}