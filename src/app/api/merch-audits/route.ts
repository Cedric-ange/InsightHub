import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM merch_audits ORDER BY created_at DESC`;

    const camelCaseData = data.map((m) => ({
      id: m.id, outlet: m.outlet, channel: m.channel, brand: m.brand,
      isOwnBrand: m.is_own_brand, facings: m.facings, shelfLengthCm: Number(m.shelf_length_cm),
      shelfPosition: m.shelf_position, outOfStock: m.out_of_stock, plvPresent: m.plv_present,
      activationPresent: m.activation_present, region: m.region, geo: m.geo,
      agentId: m.agent_id, agentName: m.agent_name, createdAt: Number(m.created_at) || 0,
      syncStatus: "synced",
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    console.error("GET /api/merch-audits:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
