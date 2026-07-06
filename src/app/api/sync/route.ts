import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissions, priceAudits, merchAudits } = body;

    if (submissions && submissions.length > 0) {
      const { error } = await supabase.from('submissions').upsert(submissions);
      if (error) throw error;
    }

    if (priceAudits && priceAudits.length > 0) {
      const { error } = await supabase.from('price_audits').upsert(priceAudits);
      if (error) throw error;
    }

    if (merchAudits && merchAudits.length > 0) {
      const { error } = await supabase.from('merch_audits').upsert(merchAudits);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: "Synchronisation réussie" }, { status: 200 });

  } catch (error) {
    console.error("Erreur API Sync:", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur inconnue";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}