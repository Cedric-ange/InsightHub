import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

// Récupération des questionnaires. Par défaut on renvoie les études publiées
// (visibles côté collecte terrain) ; ?all=1 renvoie tout le catalogue (studio).
export async function GET(request: Request) {
  try {
    const sql = getSql();
    const all = new URL(request.url).searchParams.get("all") === "1";

    const rows = all
      ? await sql`SELECT * FROM studies ORDER BY created_at DESC`
      : await sql`SELECT * FROM studies WHERE status = 'published' ORDER BY created_at DESC`;

    const data = rows.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? undefined,
      category: s.category,
      status: s.status,
      questions: s.questions ?? [],
      createdBy: s.created_by ?? undefined,
      createdAt: Number(s.created_at) || 0,
      updatedAt: Number(s.updated_at) || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("GET /api/studies:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// Création / mise à jour d'un questionnaire (upsert par id).
export async function POST(request: Request) {
  try {
    const s = await request.json();
    if (!s?.id || !s?.title) {
      return NextResponse.json(
        { success: false, error: "id et title requis" },
        { status: 400 },
      );
    }

    const sql = getSql();
    await sql`
      INSERT INTO studies (id, title, description, category, status, questions, created_by, created_at, updated_at)
      VALUES (
        ${s.id}, ${s.title}, ${s.description ?? null}, ${s.category ?? "consumer"},
        ${s.status ?? "draft"}, ${sql.json(s.questions ?? [])}, ${s.createdBy ?? null},
        ${s.createdAt ?? Date.now()}, ${s.updatedAt ?? Date.now()}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        questions = EXCLUDED.questions,
        updated_at = EXCLUDED.updated_at
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("POST /api/studies:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// Suppression d'un questionnaire.
export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "id requis" },
        { status: 400 },
      );
    }
    const sql = getSql();
    await sql`DELETE FROM studies WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("DELETE /api/studies:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
