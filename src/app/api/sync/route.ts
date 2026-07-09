import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { submissions, priceAudits, merchAudits } = await request.json();

    // Connexion Pooler Validée
    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");

    // 1. Sauvegarde des soumissions
    if (submissions && submissions.length > 0) {
      for (const s of submissions) {
        await sql`
          INSERT INTO submissions (id, study_id, study_title, agent_id, agent_name, answers, geo, started_at, finished_at, duration_sec, validation)
          VALUES (${s.id}, ${s.studyId}, ${s.studyTitle}, ${s.agentId}, ${s.agentName}, ${sql.json(s.answers)}, ${sql.json(s.geo)}, ${s.startedAt}, ${s.finishedAt}, ${s.durationSec}, ${s.validation || "pending"})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // 2. Sauvegarde des audits de prix
    if (priceAudits && priceAudits.length > 0) {
      for (const p of priceAudits) {
        await sql`
          INSERT INTO price_audits (id, outlet, channel, brand, is_own_brand, product, price, promo, available, facings, region, geo, agent_id, agent_name)
          VALUES (${p.id}, ${p.outlet}, ${p.channel}, ${p.brand}, ${p.isOwnBrand}, ${p.product}, ${p.price}, ${p.promo}, ${p.available}, ${p.facings}, ${p.region}, ${sql.json(p.geo)}, ${p.agentId}, ${p.agentName})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // 3. Sauvegarde des audits merchandising
    if (merchAudits && merchAudits.length > 0) {
      for (const m of merchAudits) {
        await sql`
          INSERT INTO merch_audits (id, outlet, channel, brand, is_own_brand, facings, shelf_length_cm, shelf_position, out_of_stock, plv_present, activation_present, region, geo, agent_id, agent_name)
          VALUES (${m.id}, ${m.outlet}, ${m.channel}, ${m.brand}, ${m.isOwnBrand}, ${m.facings}, ${m.shelfLengthCm}, ${m.shelfPosition}, ${m.outOfStock}, ${m.plvPresent}, ${m.activationPresent}, ${m.region}, ${sql.json(m.geo)}, ${m.agentId}, ${m.agentName})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    return NextResponse.json({ success: true, message: "Synchronisation réussie." });

  } catch (error: unknown) {
    console.error("Erreur de synchro:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la synchronisation";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}