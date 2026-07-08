import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email requis" }, { status: 400 });
    }

    // ⚡ Connexion Directe avec l'adresse officielle et corrigée sans faute de frappe
    const sql = postgres("postgresql://postgres:AngeToure1201@db.jiksjtyvivyvmscryrt.supabase.co:5432/postgres", { 
      ssl: "require" 
    });

    // On va chercher l'utilisateur dans la table
    const users = await sql`
      SELECT id, name, email, role, region, active 
      FROM users 
      WHERE LOWER(email) = ${email.trim().toLowerCase()} 
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Utilisateur inconnu dans la base Supabase Cloud." },
        { status: 401 }
      );
    }

    const user = users[0];
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
      },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}