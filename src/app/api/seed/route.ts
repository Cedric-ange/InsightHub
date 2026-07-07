import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Configuration fine alignée sur le marché FrieslandCampina en Côte d'Ivoire
const REGIONS = ["Abidjan - Lagunes", "Bouaké - Vallée du Bandama", "San Pedro - Bas-Sassandra"];
const OUTLETS = ["Prosuma (Hayat)", "Carrefour Marcory", "CDCI Yopougon", "Boutique de quartier Adjamé"];
const CHANNELS = ["Supermarché", "Hypermarché", "Maxi Discompte", "Boutique Traditionnelle"];
const now = Date.now();
const day = 86_400_000;

export async function GET() {
  try {
    // 1. SYNCHRONISATION DES COMPTES CORPORATE (Pour l'Onboarding / Simulation)
    // Insertion de la liste calquée sur le fichier auth.ts pour lier le front et la base Supabase
    const testUsers = [
      { id: "u_admin", name: "Cédric Touré", email: "toure.cedric@frieslandcampina.com", role: "ADMIN", active: true, created_at: now },
      { id: "u_manager", name: "Patrick Epee", email: "epee.patrick@frieslandcampina.com", role: "MANAGER", active: true, created_at: now },
      { id: "u_analyst", name: "Delaure Dian", email: "dian.delaure@frieslandcampina.com", role: "ANALYST", active: true, created_at: now },
      { id: "u_supervisor", name: "Sonia Kouman", email: "kouman.sonia@frieslandcampina.com", role: "SUPERVISOR", active: true, created_at: now },
      { id: "u_agent", name: "Moussa Traoré", email: "marie.jeanne@frieslandcampina.com", role: "FIELD_AGENT", active: true, created_at: now }
    ];
    
    const { error: userError } = await supabase.from('users').upsert(testUsers);
    if (userError) throw userError;

    // 2. CONFIGURATION DE L'ÉTUDE GUIDE (Modèle 6P - Lancement Bonnet Rouge Poudre)
    const onboardingStudy = {
      id: "study_onboarding_bonnet_rouge",
      title: "[GUIDE] Évaluation Lancement Bonnet Rouge Format Familial",
      category: "product_launch",
      status: "published",
      created_by: "u_admin", // Lié au compte administrateur principal
      created_at: now - 5 * day,
      updated_at: now - 1 * day,
      questions: [
        { id: "q_br_dispo", type: "boolean", label: "Le nouveau format Bonnet Rouge Familial est-il disponible en rayon ?", required: true, sixp: "PLACE" },
        { id: "q_br_prix", type: "number", label: "Prix de vente observé (Prix conseillé : 1200 FCFA)", required: true, sixp: "PRICE" },
        { id: "q_br_facing", type: "number", label: "Nombre de facings du produit en linéaire", required: true, sixp: "PRODUCT" },
        { id: "q_br_promo", type: "boolean", label: "Présence d'une activation ou PLV Bonnet Rouge ?", required: true, sixp: "PROMOTION" },
        { id: "q_br_feedback", type: "single_choice", label: "Avis du gérant sur l'accueil du packaging par les clients", required: false, options: ["Excellent", "Favorable", "Mitigé", "Négatif"], sixp: "PACK" }
      ]
    };
    
    const { error: studyError } = await supabase.from('studies').upsert([onboardingStudy]);
    if (studyError) throw studyError;

    // 3. HISTORIQUE DE DONNÉES DE MARCHÉ (Pour alimenter vos composants graphiques)
    const mockPriceAudits = [];
    const productsList = ["Bonnet Rouge Concentré 160g", "Bonnet Rouge Poudre Familial", "Nestlé Bonnet Vert", "Peak Lait"];
    
    for (let i = 0; i < 40; i++) { // Augmenté à 40 entrées pour des graphiques plus denses et réalistes
      const mod = i % 4;
      const isBR = mod < 2; // Les 2 premiers produits appartiennent à FrieslandCampina
      const productSelected = productsList[mod];
      
      let brandSelected = "Bonnet Rouge";
      if (mod === 2) brandSelected = "Nestlé";
      if (mod === 3) brandSelected = "Peak";
      
      // Détermination d'un prix cohérent en FCFA selon le produit
      let targetPrice = 500;
      if (productSelected === "Bonnet Rouge Poudre Familial") targetPrice = 1200;
      if (productSelected === "Nestlé Bonnet Vert") targetPrice = 450;
      if (productSelected === "Peak Lait") targetPrice = 550;

      mockPriceAudits.push({
        id: `pa_guide_${i}`,
        outlet: OUTLETS[i % OUTLETS.length],
        channel: CHANNELS[i % CHANNELS.length],
        brand: brandSelected,
        is_own_brand: isBR,
        product: productSelected,
        price: targetPrice + (i % 3 === 0 ? 50 : 0) - (i % 5 === 0 ? 25 : 0), // Simule de légères variations de prix sur le marché
        promo: i % 4 === 0,
        available: i % 9 !== 0,
        facings: isBR ? 3 + (i % 3) : 2 + (i % 2), // Donne un léger avantage de part linéaire à Bonnet Rouge
        region: REGIONS[i % REGIONS.length],
        agent_name: i % 2 === 0 ? "Moussa Traoré" : "Sonia Kouman",
        sync_status: "synced",
        created_at: now - (i * 6 * 3600 * 1000) // Données fluides étalées sur les dernières semaines
      });
    }
    
    const { error: priceError } = await supabase.from('price_audits').upsert(mockPriceAudits);
    if (priceError) throw priceError;

    return NextResponse.json({ 
      success: true, 
      message: "FIP Database : Base Supabase réinitialisée et alimentée avec succès avec la charte @frieslandcampina.com !",
      synchronizedAccounts: testUsers.map(u => u.email)
    });
  } catch (error) {
    console.error("Erreur durant l'initialisation du Guide d'Onboarding :", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}