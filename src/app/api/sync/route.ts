import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissions, priceAudits, merchAudits } = body;

    // 1. Sauvegarde des questionnaires génériques (si présents dans la file)
    if (submissions && submissions.length > 0) {
      const { error } = await supabase.from('submissions').upsert(submissions);
      if (error) throw error;
    }

    // 2. Sauvegarde des relevés d'audits prix
    if (priceAudits && priceAudits.length > 0) {
      const { error } = await supabase.from('price_audits').upsert(priceAudits);
      if (error) throw error;
    }

    // 3. Sauvegarde des relevés de merchandising (facings, PLV, ruptures)
    if (merchAudits && merchAudits.length > 0) {
      const { error } = await supabase.from('merch_audits').upsert(merchAudits);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: "Synchronisation réussie" }, { status: 200 });

  } catch (error: any) {
    console.error("Erreur API Sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}