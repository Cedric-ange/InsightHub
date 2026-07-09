import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");
    const data = await sql`SELECT * FROM merch_audits ORDER BY created_at DESC`;

    const camelCaseData = data.map((m) => ({
      id: m.id, outlet: m.outlet, channel: m.channel, brand: m.brand,
      isOwnBrand: m.is_own_brand, facings: m.facings, shelfLengthCm: m.shelf_length_cm,
      shelfPosition: m.shelf_position, outOfStock: m.out_of_stock, plvPresent: m.plv_present,
      activationPresent: m.activation_present, region: m.region, geo: m.geo,
      agentId: m.agent_id, agentName: m.agent_name, createdAt: m.created_at,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    console.error("Erreur API Login:", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}