import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email requis" }, { status: 400 });
    }

    // ⚡ Connexion Directe en un clin d'œil avec la variable DATABASE_URL
    const sql = postgres(process.env.DATABASE_URL!, { ssl: "allow" });

    // On cherche l'utilisateur dans la vraie table 'users' de Supabase
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

    if (!user.active) {
      return NextResponse.json(
        { success: false, error: "Ce compte est actuellement désactivé." },
        { status: 403 }
      );
    }

    // Connexion réussie ! On renvoie le profil utilisateur complet au store auth frontend
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
    const msg = error instanceof Error ? error.message : "Erreur serveur lors de l'authentification";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}