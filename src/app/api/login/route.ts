import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email requis" }, { status: 400 });
    }

    // Connexion via le Pooler
    const sql = postgres("postgresql://postgres.jiksjctyvivyvmscryrt:AngeToure1234@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require");

    // 💡 Correction : Sélection uniquement des colonnes qui existent réellement
    const users = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE LOWER(email) = ${email.trim().toLowerCase()} 
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Utilisateur inconnu." },
        { status: 401 }
      );
    }

    const user = users[0];
    
    // Retourne l'utilisateur avec ses données réelles
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: unknown) {
    console.error("Erreur API Login:", error);
    return NextResponse.json({ success: false, error: "Erreur interne" }, { status: 500 });
  }
}