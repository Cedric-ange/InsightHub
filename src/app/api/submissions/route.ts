import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

// Connexion Directe (Port 5432)
const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

export async function GET() {
  try {
    const data = await sql`SELECT * FROM submissions ORDER BY created_at DESC`;

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
    const msg = error instanceof Error ? error.message : "Erreur SQL Direct Submissions";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}