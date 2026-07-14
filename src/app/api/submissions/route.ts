import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getSql();
    const data = await sql`SELECT * FROM submissions ORDER BY created_at DESC`;

    const camelCaseData = data.map((s) => ({
      id: s.id, studyId: s.study_id, studyTitle: s.study_title,
      agentId: s.agent_id, agentName: s.agent_name, answers: s.answers,
      geo: s.geo, startedAt: Number(s.started_at) || 0, finishedAt: Number(s.finished_at) || 0,
      durationSec: s.duration_sec, validation: s.validation, createdAt: Number(s.created_at) || 0,
      syncStatus: "synced",
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    console.error("GET /api/submissions:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
