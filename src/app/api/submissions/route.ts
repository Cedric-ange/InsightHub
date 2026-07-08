import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

// Initialisation du pooler direct
const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

export async function GET() {
  try {
    // Requête SQL directe à la base de données de production
    const data = await sql`
      SELECT * FROM submissions 
      ORDER BY created_at DESC
    `;

    // Le remappage reste identique pour ton frontend
    const camelCaseData = data.map((s) => ({
      id: s.id,
      studyId: s.study_id,
      studyTitle: s.study_title,
      agentId: s.agent_id,
      agentName: s.agent_name,
      answers: s.answers,
      geo: s.geo,
      startedAt: s.started_at,
      finishedAt: s.finished_at,
      durationSec: s.duration_sec,
      validation: s.validation,
      createdAt: s.created_at,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur de connexion SQL direct";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}