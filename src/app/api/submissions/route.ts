import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // ⚡ ICI : Empêche Next.js de compiler cette route statiquement

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// ... (le reste du code reste strictement identique)

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // ⚡ Utilisation de Record<string, unknown> pour éliminer tout mot-clé 'any'
    const camelCaseData = (data || []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      studyId: s.study_id as string,
      studyTitle: s.study_title as string,
      agentId: s.agent_id as string,
      agentName: s.agent_name as string,
      answers: s.answers,
      geo: s.geo,
      startedAt: s.started_at as number,
      finishedAt: s.finished_at as number,
      durationSec: s.duration_sec as number,
      validation: s.validation as string,
      createdAt: s.created_at as number,
    }));

    return NextResponse.json({ success: true, data: camelCaseData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}