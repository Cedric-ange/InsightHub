import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ⚡ Déplacé à l'intérieur
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from("price_audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const camelCaseData = (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      outlet: p.outlet as string,
      channel: p.channel as string,
      brand: p.brand as string,
      isOwnBrand: p.is_own_brand as boolean,
      product: p.product as string,
      price: p.price as number,
      promo: p.promo as boolean,
      available: p.available as boolean,
      facings: p.facings as number | null,
      region: p.region as string | null,
      geo: p.geo,
      agentId: p.agent_id as string,
      agentName: p.agent_name as string,
      createdAt: p.created_at as number,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}