import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: "Configuration serveur Supabase manquante." }, { status: 500 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Identifiants invalides ou utilisateur introuvable." }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
    }

// Retourne le profil utilisateur s'il est validé en forçant le rôle en MAJUSCULES
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toUpperCase() // ⚡ ICI : Aligne le format pour Zustand
      }
    });

  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}