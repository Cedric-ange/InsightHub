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
      .from("merch_audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const camelCaseData = (data || []).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      outlet: m.outlet as string,
      channel: m.channel as string,
      brand: m.brand as string,
      isOwnBrand: m.is_own_brand as boolean,
      facings: m.facings as number,
      shelfLengthCm: m.shelf_length_cm as number,
      shelfPosition: m.shelf_position as string,
      outOfStock: m.out_of_stock as boolean,
      plvPresent: m.plv_present as boolean,
      activationPresent: m.activation_present as boolean,
      region: m.region as string | null,
      geo: m.geo,
      agentId: m.agent_id as string,
      agentName: m.agent_name as string,
      createdAt: m.created_at as number,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}