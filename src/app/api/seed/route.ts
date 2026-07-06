import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEMO_ACCOUNTS } from '@/lib/auth';

const REGIONS = ["Abidjan", "Bouaké", "San Pedro"];
const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque Adjamé", "Boutique Yopougon"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"];
const now = Date.now();
const day = 86_400_000;

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Utilisation de Omit pour typer strictement un utilisateur sans son mot de passe
    const users = DEMO_ACCOUNTS.map((account) => {
      const { password, ...userWithoutPassword } = account;
      void password; // Indique explicitement au compilateur que l'isolement est volontaire
      return userWithoutPassword;
    });
    
    await supabase.from('users').upsert(users);

    const tasteStudy = {
      id: "study_taste",
      title: "Dégustation nouvelle marque Biscuit",
      category: "taste_test",
      status: "published",
      created_by: "u_analyst",
      created_at: now - 10 * day,
      updated_at: now - 3 * day,
      questions: [
        { id: "q_taste_like", type: "single_choice", label: "Avez-vous apprécié le goût ?", required: true, options: ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"], sixp: "PRODUCT" },
        { id: "q_taste_texture", type: "rating", label: "Notez la texture (1 à 10)", required: true, min: 1, max: 10, sixp: "PRODUCT" }
      ]
    };
    await supabase.from('studies').upsert([tasteStudy]);

    const priceAudits = [];
    for (let i = 0; i < 10; i++) {
      priceAudits.push({
        id: `pa_init_${i}`,
        outlet: OUTLETS[i % OUTLETS.length],
        channel: CHANNELS[i % CHANNELS.length],
        brand: i % 2 === 0 ? "Notre marque" : "Nestlé",
        is_own_brand: i % 2 === 0,
        product: "Biscuit 16g",
        price: 480,
        promo: false,
        available: true,
        region: REGIONS[i % REGIONS.length],
        agent_name: "Moussa Traoré",
        sync_status: "synced",
        created_at: now - i * day
      });
    }
    await supabase.from('price_audits').upsert(priceAudits);

    return NextResponse.json({ success: true, message: "Base Supabase alimentée avec succès !" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}