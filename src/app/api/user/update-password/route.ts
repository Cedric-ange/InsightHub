import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    // ⚡ CORRECTION 1 : On lève l'ambiguïté pour TypeScript en vérifiant la présence des chaînes
    if (!url || !key) {
      return NextResponse.json(
        { error: "Variables d'environnement de configuration manquantes." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // 1. Vérifier que l'utilisateur existe et que l'ancien mot de passe est correct
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !user || user.password !== currentPassword) {
      return NextResponse.json({ error: "Email ou mot de passe actuel incorrect." }, { status: 401 });
    }

    // 2. Mettre à jour avec le nouveau mot de passe sécurisé
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("email", email);

    if (updateError) {
      return NextResponse.json({ error: "Impossible de mettre à jour le mot de passe." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Mot de passe mis à jour avec succès !" });

  } catch {
    // ⚡ CORRECTION 2 : On retire la variable '(err)' non lue pour satisfaire ESLint
    return NextResponse.json({ error: "Erreur serveur lors de la mise à jour." }, { status: 500 });
  }
}