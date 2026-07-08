import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// On initialise le client Supabase Server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Récupère les vraies soumissions triées par date
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Remappage des colonnes snake_case de Supabase vers le camelCase du frontend
    const camelCaseData = (data || []).map((s) => ({
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}