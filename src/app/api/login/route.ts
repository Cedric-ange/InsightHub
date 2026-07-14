import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    const sql = getSql();
    const users = await sql`
      SELECT id, name, email, role, password
      FROM users
      WHERE LOWER(email) = ${email.trim().toLowerCase()}
      LIMIT 1
    `;

    if (users.length === 0 || users[0].password !== password) {
      return NextResponse.json(
        { success: false, error: "Identifiants invalides." },
        { status: 401 },
      );
    }

    const user = users[0];
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur interne";
    console.error("POST /api/login:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
