import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM price_audits ORDER BY created_at DESC`;

    const camelCaseData = data.map((p) => ({
      id: p.id, outlet: p.outlet, channel: p.channel, brand: p.brand,
      isOwnBrand: p.is_own_brand, product: p.product, price: Number(p.price),
      promo: p.promo, available: p.available, facings: p.facings,
      region: p.region, geo: p.geo, agentId: p.agent_id, agentName: p.agent_name,
      createdAt: Number(p.created_at) || 0, syncStatus: "synced",
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    console.error("GET /api/price-audits:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
