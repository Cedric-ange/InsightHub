import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEMO_ACCOUNTS } from '@/lib/auth';

const REGIONS = ["Abidjan", "Bouaké", "San Pedro"]; [cite: 324-329]
const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque Adjamé", "Boutique Yopougon"]; [cite: 432-435]
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"]; [cite: 536]
const now = Date.now();
const day = 86_400_000;

export async function GET() {
  try {
    // Le préfixe "_" indique à l'anti-linter de ne pas lever d'erreur sur l'inutilisation
    const users = DEMO_ACCOUNTS.map((account) => {
      const { password: _password, ...userWithoutPassword } = account;
      return userWithoutPassword;
    });
    
    await supabase.from('users').upsert(users);

    const tasteStudy = {
      id: "study_taste", [cite: 421]
      title: "Dégustation nouvelle marque Biscuit", [cite: 391, 421]
      category: "taste_test",
      status: "published",
      created_by: "u_analyst",
      created_at: now - 10 * day,
      updated_at: now - 3 * day,
      questions: [
        { id: "q_taste_like", type: "single_choice", label: "Avez-vous apprécié le goût ?", required: true, options: ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"], sixp: "PRODUCT" }, [cite: 392-397, 565]
        { id: "q_taste_texture", type: "rating", label: "Notez la texture (1 à 10)", required: true, min: 1, max: 10, sixp: "PRODUCT" } [cite: 201, 510, 565]
      ]
    };
    await supabase.from('studies').upsert([tasteStudy]);

    const priceAudits = [];
    for (let i = 0; i < 10; i++) {
      priceAudits.push({
        id: `pa_init_${i}`,
        outlet: OUTLETS[i % OUTLETS.length], [cite: 136]
        channel: CHANNELS[i % CHANNELS.length], [cite: 137]
        brand: i % 2 === 0 ? "Notre marque" : "Nestlé", [cite: 139, 180, 182]
        is_own_brand: i % 2 === 0,
        product: "Biscuit 16g", [cite: 138]
        price: 480, [cite: 140]
        promo: false, [cite: 141]
        available: true, [cite: 142]
        region: REGIONS[i % REGIONS.length],
        agent_name: "Moussa Traoré", [cite: 415]
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