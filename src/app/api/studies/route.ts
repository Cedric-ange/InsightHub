import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ⚡ Connexion directe via le pooler unifié pour récupérer les questionnaires en temps réel
    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");
    
    // Récupération de toutes les études actives qui ne sont pas des brouillons
    const data = await sql`SELECT * FROM studies WHERE status = 'published' ORDER BY created_at DESC`;

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Erreur de récupération des études:", error);
    return NextResponse.json({ success: false, error: "Impossible de charger les questionnaires" }, { status: 500 });
  }
}