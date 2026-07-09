import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");
    const data = await sql`SELECT * FROM price_audits ORDER BY created_at DESC`;

    const camelCaseData = data.map((p) => ({
      id: p.id, outlet: p.outlet, channel: p.channel, brand: p.brand,
      isOwnBrand: p.is_own_brand, product: p.product, price: p.price,
      promo: p.promo, available: p.available, facings: p.facings,
      region: p.region, geo: p.geo, agentId: p.agent_id, agentName: p.agent_name, createdAt: p.created_at,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    console.error("Erreur API Login:", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}