import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Configuration des données proches du marché Bonnet Rouge à Abidjan
const REGIONS = ["Abidjan - Lagunes", "Bouaké - Vallée du Bandama", "San Pedro - Bas-Sassandra"];
const OUTLETS = ["Prosuma (Hayat)", "Carrefour Marcory", "CDCI Yopougon", "Boutique de quartier Adjamé"];
const CHANNELS = ["Supermarché", "Hypermarché", "Maxi Discompte", "Boutique Traditionnelle"];
const now = Date.now();
const day = 86_400_000;

export async function GET() {
  try {
    // 1. CRÉATION DES COMPTES DE TEST (Pour l'Onboarding / Simulation)
    // Ces comptes permettent de guider l'utilisateur sans polluer la liste des vrais agents de prod.
    const testUsers = [
      { id: "u_test_analyst", name: "Anonyme (Test Analyste)", email: "test.analyst@insighthub.ci", role: "ANALYST", active: true, created_at: now },
      { id: "u_test_agent", name: "Moussa (Test Enquêteur)", email: "test.enqueteur@insighthub.ci", role: "FIELD_AGENT", active: true, created_at: now }
    ];
    
    const { error: userError } = await supabase.from('users').upsert(testUsers);
    if (userError) throw userError;

    // 2. CONFIGURATION D'UNE ÉTUDE GUIDE (Modèle 6P - Lancement Bonnet Rouge Poudre)
    // Sert de modèle de référence pour montrer comment l'IBP exploite les données
    const onboardingStudy = {
      id: "study_onboarding_bonnet_rouge",
      title: "[GUIDE] Évaluation Lancement Bonnet Rouge Format Familial",
      category: "product_launch",
      status: "published",
      created_by: "u_test_analyst",
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

    // 3. JEU DE DONNÉES SIMULÉES (Historique pour alimenter les graphiques d'Analytics)
    // Permet de simuler un historique d'audit pour le Lait Bonnet Rouge vs Concurrents (ex: Peak, Nestlé)
    const mockPriceAudits = [];
    const productsList = ["Bonnet Rouge Concentré 160g", "Bonnet Rouge Poudre Familial", "Concurrent Lait Concentré"];
    
    for (let i = 0; i < 15; i++) {
      const isBR = i % 3 !== 0; // 2 tiers des données sur Bonnet Rouge
      const productSelected = isBR ? productsList[i % 2] : productsList[2];
      const brandSelected = isBR ? "Bonnet Rouge" : "Concurrent Principal";
      
      mockPriceAudits.push({
        id: `pa_guide_${i}`,
        outlet: OUTLETS[i % OUTLETS.length],
        channel: CHANNELS[i % CHANNELS.length],
        brand: brandSelected,
        is_own_brand: isBR,
        product: productSelected,
        price: brandSelected === "Bonnet Rouge" ? (i % 2 === 0 ? 500 : 1200) : 550,
        promo: i % 4 === 0,
        available: i % 7 !== 0,
        facings: 2 + (i % 4),
        region: REGIONS[i % REGIONS.length],
        agent_name: "Moussa (Test Enquêteur)",
        sync_status: "synced",
        created_at: now - (i * 12 * 3600 * 1000) // Données réparties sur les derniers jours
      });
    }
    
    const { error: priceError } = await supabase.from('price_audits').upsert(mockPriceAudits);
    if (priceError) throw priceError;

    return NextResponse.json({ 
      success: true, 
      message: "FIP Onboarding Guide : Mode simulation initialisé avec succès pour Bonnet Rouge Abidjan !",
      guide: {
        compte_test_analyst: "test.analyst@insighthub.ci",
        compte_test_enqueteur: "test.enqueteur@insighthub.ci",
        methode: "Utilisez ces comptes pour faire vos simulations sans impacter la production réelle."
      }
    });
  } catch (error) {
    console.error("Erreur durant l'initialisation du Guide d'Onboarding :", error);
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}