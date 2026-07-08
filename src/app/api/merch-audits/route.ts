import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("merch_audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const camelCaseData = (data || []).map((m) => ({
      id: m.id,
      outlet: m.outlet,
      channel: m.channel,
      brand: m.brand,
      isOwnBrand: m.is_own_brand,
      facings: m.facings,
      shelfLengthCm: m.shelf_length_cm,
      shelfPosition: m.shelf_position,
      outOfStock: m.out_of_stock,
      plvPresent: m.plv_present,
      activationPresent: m.activation_present,
      region: m.region,
      geo: m.geo,
      agentId: m.agent_id,
      agentName: m.agent_name,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}