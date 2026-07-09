import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { submissions, priceAudits, merchAudits } = await request.json();

    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");

    // 1. Sauvegarde des soumissions (submissions)
    if (submissions && submissions.length > 0) {
      for (const s of submissions) {
        await sql`
          INSERT INTO submissions (id, study_id, study_title, agent_id, agent_name, answers, geo, started_at, finished_at, duration_sec, validation, created_at)
          VALUES (${s.id}, ${s.studyId}, ${s.studyTitle}, ${s.agentId}, ${s.agentName}, ${sql.json(s.answers)}, ${sql.json(s.geo || null)}, ${s.startedAt || null}, ${s.finishedAt || null}, ${s.durationSec || 0}, ${s.validation || "pending"}, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // 2. Sauvegarde des audits de prix
    if (priceAudits && priceAudits.length > 0) {
      for (const p of priceAudits) {
        await sql`
          INSERT INTO price_audits (id, outlet, channel, brand, is_own_brand, product, price, promo, available, facings, region, geo, agent_id, agent_name, created_at)
          VALUES (${p.id}, ${p.outlet}, ${p.channel}, ${p.brand}, ${p.isOwnBrand}, ${p.product}, ${p.price}, ${p.promo}, ${p.available}, ${p.facings || null}, ${p.region}, ${sql.json(p.geo || null)}, ${p.agentId}, ${p.agentName}, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // 3. Sauvegarde des audits merchandising
    if (merchAudits && merchAudits.length > 0) {
      for (const m of merchAudits) {
        await sql`
          INSERT INTO merch_audits (id, outlet, channel, brand, is_own_brand, facings, shelf_length_cm, shelf_position, out_of_stock, plv_present, activation_present, region, geo, agent_id, agent_name, created_at)
          VALUES (${m.id}, ${m.outlet}, ${m.channel}, ${m.brand}, ${m.isOwnBrand}, ${m.facings || null}, ${m.shelfLengthCm || null}, ${m.shelfPosition || null}, ${m.outOfStock}, ${m.plvPresent}, ${m.activationPresent}, ${m.region}, ${sql.json(m.geo || null)}, ${m.agentId}, ${m.agentName}, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true, message: "Synchronisation réussie." });

  } catch (error: unknown) {
    console.error("Erreur critique de synchronisation:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la synchronisation";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}