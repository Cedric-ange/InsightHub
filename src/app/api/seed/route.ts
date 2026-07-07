import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Variables Supabase manquantes côté serveur." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    // 1. Initialisation des Études (Questionnaires de référence)
    const seedStudies = [
      {
        id: "study_lait_concentre_2026",
        title: "Lancement Pilote Abidjan 2026 - Lait Concentré",
        description: "Suivi de la disponibilité, des prix et des facings Bonnet Rouge vs Peak/Loya.",
        category: "Études consommateurs"
      },
      {
        id: "study_lait_poudre_2026",
        title: "Consumer Connect — Lait en Poudre & Nutrition",
        description: "Analyse de la pénétration des formats sachets Bonnet Rouge Poudre vs Nido/Milo.",
        category: "Études consommateurs"
      }
    ];

    // 2. Initialisation d'Audits de Prix témoins (Mockups réalistes de départ)
    const seedPriceAudits = [
      {
        id: "seed_pa_001",
        outlet: "Supermarché Prosuma Hayat",
        channel: "Supermarché",
        brand: "Bonnet Rouge",
        is_own_brand: true,
        product: "Lait Concentré Sucré Bonnet Rouge - Boite 400g",
        price: 750,
        promo: false,
        available: true,
        facings: 6,
        region: "Abidjan - Lagunes",
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        created_at: Date.now()
      },
      {
        id: "seed_pa_002",
        outlet: "Boutique de quartier Adjamé",
        channel: "Boutique Traditionnelle",
        brand: "Peak",
        is_own_brand: false,
        product: "Lait Concentré Non Sucré Peak - Boite 170g",
        price: 500,
        promo: false,
        available: true,
        facings: 3,
        region: "Abidjan - Lagunes",
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        created_at: Date.now()
      },
      {
        id: "seed_pa_003",
        outlet: "Marché de Marcory",
        channel: "Marché traditionnel",
        brand: "Loya",
        is_own_brand: false,
        product: "Lait en Poudre Loya - Sachet 400g",
        price: 1900,
        promo: false,
        available: true,
        facings: 4,
        region: "Abidjan - Lagunes",
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        created_at: Date.now()
      }
    ];

    // Injection dans la table 'studies'
    const { error: errorStudies } = await supabase
      .from("studies")
      .upsert(seedStudies, { onConflict: "id" });

    if (errorStudies) throw new Error(`Erreur studies: ${errorStudies.message}`);

    // Injection dans la table 'price_audits'
    const { error: errorPrices } = await supabase
      .from("price_audits")
      .upsert(seedPriceAudits, { onConflict: "id" });

    if (errorPrices) throw new Error(`Erreur price_audits: ${errorPrices.message}`);

    return NextResponse.json({
      success: true,
      message: "La base de données Supabase a été initialisée avec succès avec les données réelles !",
      studiesInserted: seedStudies.length,
      priceAuditsInserted: seedPriceAudits.length
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur interne lors du seed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}