import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("price_audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const camelCaseData = (data || []).map((p) => ({
      id: p.id,
      outlet: p.outlet,
      channel: p.channel,
      brand: p.brand,
      isOwnBrand: p.is_own_brand,
      product: p.product,
      price: p.price,
      promo: p.promo,
      available: p.available,
      facings: p.facings,
      region: p.region,
      geo: p.geo,
      agentId: p.agent_id,
      agentName: p.agent_name,
      createdAt: p.created_at,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}