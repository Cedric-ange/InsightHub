import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

// UPSERT idempotent (par id) des enregistrements collectés hors-ligne.
// Le corps reçu est { table, records } où records est déjà en snake_case
// (voir src/lib/sync.ts). Les colonnes jsonb sont sérialisées explicitement.
export async function POST(request: Request) {
  try {
    const { table, records } = (await request.json()) as {
      table: string;
      records: Row[];
    };

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const sql = getSql();

    if (table === "submissions") {
      for (const r of records) {
        await sql`
          INSERT INTO submissions (id, study_id, study_title, agent_id, agent_name, answers, geo, started_at, finished_at, duration_sec, validation, created_at)
          VALUES (${r.id as string}, ${r.study_id as string}, ${(r.study_title as string) ?? null}, ${(r.agent_id as string) ?? null}, ${(r.agent_name as string) ?? null}, ${sql.json((r.answers ?? []) as never)}, ${sql.json((r.geo ?? null) as never)}, ${(r.started_at as number) ?? null}, ${(r.finished_at as number) ?? null}, ${(r.duration_sec as number) ?? null}, ${(r.validation as string) ?? "submitted"}, ${(r.created_at as number) ?? null})
          ON CONFLICT (id) DO UPDATE SET
            answers = excluded.answers, geo = excluded.geo,
            validation = excluded.validation, study_title = excluded.study_title
        `;
      }
    } else if (table === "price_audits") {
      for (const r of records) {
        await sql`
          INSERT INTO price_audits (id, outlet, channel, brand, is_own_brand, product, price, promo, available, facings, region, geo, agent_id, agent_name, created_at)
          VALUES (${r.id as string}, ${(r.outlet as string) ?? null}, ${(r.channel as string) ?? null}, ${(r.brand as string) ?? null}, ${(r.is_own_brand as boolean) ?? null}, ${(r.product as string) ?? null}, ${(r.price as number) ?? null}, ${(r.promo as boolean) ?? null}, ${(r.available as boolean) ?? null}, ${(r.facings as number) ?? null}, ${(r.region as string) ?? null}, ${sql.json((r.geo ?? null) as never)}, ${(r.agent_id as string) ?? null}, ${(r.agent_name as string) ?? null}, ${(r.created_at as number) ?? null})
          ON CONFLICT (id) DO UPDATE SET
            price = excluded.price, promo = excluded.promo, available = excluded.available, facings = excluded.facings
        `;
      }
    } else if (table === "merch_audits") {
      for (const r of records) {
        await sql`
          INSERT INTO merch_audits (id, outlet, channel, brand, is_own_brand, facings, shelf_length_cm, shelf_position, out_of_stock, plv_present, activation_present, region, geo, agent_id, agent_name, created_at)
          VALUES (${r.id as string}, ${(r.outlet as string) ?? null}, ${(r.channel as string) ?? null}, ${(r.brand as string) ?? null}, ${(r.is_own_brand as boolean) ?? null}, ${(r.facings as number) ?? null}, ${(r.shelf_length_cm as number) ?? null}, ${(r.shelf_position as string) ?? null}, ${(r.out_of_stock as boolean) ?? null}, ${(r.plv_present as boolean) ?? null}, ${(r.activation_present as boolean) ?? null}, ${(r.region as string) ?? null}, ${sql.json((r.geo ?? null) as never)}, ${(r.agent_id as string) ?? null}, ${(r.agent_name as string) ?? null}, ${(r.created_at as number) ?? null})
          ON CONFLICT (id) DO UPDATE SET
            facings = excluded.facings, out_of_stock = excluded.out_of_stock, plv_present = excluded.plv_present, activation_present = excluded.activation_present
        `;
      }
    } else {
      return NextResponse.json(
        { success: false, error: `Table non autorisée: ${table}` },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, count: records.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur lors de la synchronisation";
    console.error("POST /api/sync:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
