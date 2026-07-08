import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    // Force la lecture des variables avec ou sans préfixe système Vercel
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Variables Supabase manquantes sur la route de synchronisation." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    // ... reste de ton code existant (la boucle qui reçoit les price_audits, merch_audits, etc.)

    const now = Date.now();
    const day = 86_400_000;

    const REGIONS = ["Abidjan - Lagunes", "Bouaké - Vallée du Bandama", "San Pedro - Bas-Sassandra"];
    const OUTLETS = ["Supermarché Prosuma Hayat", "Carrefour Marcory", "CDCI Yopougon", "Kiosque Adjamé", "Boutique de quartier Yopougon"];
    const CHANNELS = ["Hypermarché", "Supermarché", "Boutique Traditionnelle", "Kiosque"];

    const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];

    // 1. Table 'users'
    const seedUsers = [
      { id: "agent_cedric_01", name: "Cédric Touré", email: "cedric.toure@insighthub.ci", role: "Administrateur" },
      { id: "agent_terrain_02", name: "Amadou Koné", email: "amadou.kone@field.ci", role: "Agent" }
    ];

    // 2. Table 'studies'
    const seedStudies = [
      {
        id: "guide_retail",
        title: "Consumer Connect — Grande distribution",
        description: "Guide d'entretien chef de rayon / manager (Auchan, Prosuma, Carrefour). Référencement, promotions, ruptures et réaction prix Bonnet Rouge.",
        category: "consumer"
      },
      {
        id: "guide_consumer",
        title: "Consumer Connect — Consommateurs",
        description: "Guide d'entretien consommateur en sortie de marché / point de vente. Critères de choix, confiance de marque et budget lait.",
        category: "consumer"
      }
    ];

    // 3. Table 'price_audits' (Génération exacte des 30 relevés du Mockup)
    const seedPriceAudits = [];
    const productsOwn = ["Lait Concentré Sucré Bonnet Rouge 400g", "Lait en Poudre Bonnet Rouge Sachet 400g"];
    const productsComp = ["Lait Concentré Peak 170g", "Lait en Poudre Loya Sachet 400g", "Lait en Poudre Nido Boîte 400g"];

    for (let i = 0; i < 30; i++) {
      const own = i % 2 === 0;
      seedPriceAudits.push({
        id: `seed_pa_${String(i + 1).padStart(0, '3')}`,
        outlet: pick(OUTLETS, i),
        channel: pick(CHANNELS, i),
        brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya", "Nido"], i),
        is_own_brand: own,
        product: own ? pick(productsOwn, i) : pick(productsComp, i),
        price: own ? (i % 2 === 0 ? 750 : 1800) : (i % 3 === 0 ? 500 : 1900),
        promo: i % 5 === 0,
        available: i % 8 !== 0,
        facings: 3 + (i % 5),
        region: pick(REGIONS, i),
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        created_at: now - (i % 12) * day
      });
    }

    // 4. Table 'merch_audits' (Génération des 24 relevés de linéaires conformes)
    const seedMerchAudits = [];
    const positions = ["eye", "top", "middle", "bottom"];

    for (let i = 0; i < 24; i++) {
      const own = i % 2 === 0;
      seedMerchAudits.push({
        id: `seed_ma_${String(i + 1).padStart(0, '3')}`,
        outlet: pick(OUTLETS, i),
        channel: pick(CHANNELS, i),
        brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya"], i),
        is_own_brand: own,
        facings: own ? 6 + (i % 4) : 3 + (i % 3),
        shelf_length_cm: own ? 120 : 60,
        shelf_position: own ? "eye" : pick(positions, i),
        out_of_stock: i % 9 === 0,
        plv_present: own || i % 4 === 0,
        activation_present: own && i % 3 === 0,
        region: pick(REGIONS, i),
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        created_at: now - (i % 10) * day
      });
    }

    // 5. Table 'submissions' (Génération de 40 soumissions de formulaires)
    const seedSubmissions = [];
    const choiceVals = ["Prix", "Marque (Ex: Bonnet Rouge)", "Format Sachet/Boîte", "Habitude familiale"];
    const budgetVals = ["A augmenté", "Est stable", "A diminué"];

    for (let i = 0; i < 40; i++) {
      const started = now - (i % 14) * day - i * 3600_000;
      const dur = 120 + (i % 8) * 30;
      seedSubmissions.push({
        id: `seed_sub_${String(i + 1).padStart(0, '3')}`,
        study_id: "guide_consumer",
        study_title: "Consumer Connect — Consommateurs",
        agent_id: "agent_cedric_01",
        agent_name: "Cédric Touré",
        answers: {
          gc_criteria: pick(choiceVals, i),
          gc_trust: i % 3 !== 0,
          gc_budget: pick(budgetVals, i),
          gc_nps: 8 + (i % 3)
        },
        geo: { lat: 5.3484 + (i % 5) * 0.01, lng: -3.9785 - (i % 5) * 0.01 },
        started_at: new Date(started).toISOString(),
        finished_at: new Date(started + dur * 1000).toISOString(),
        duration_sec: dur,
        validation: i % 4 === 0 ? "submitted" : "validated",
        created_at: new Date(started + dur * 1000).toISOString()
      });
    }

    // Exécution des requêtes d'initialisation propre (Upsert) dans Supabase
    await Promise.all([
      supabase.from("users").upsert(seedUsers, { onConflict: "id" }),
      supabase.from("studies").upsert(seedStudies, { onConflict: "id" }),
      supabase.from("price_audits").upsert(seedPriceAudits, { onConflict: "id" }),
      supabase.from("merch_audits").upsert(seedMerchAudits, { onConflict: "id" }),
      supabase.from("submissions").upsert(seedSubmissions, { onConflict: "id" })
    ]);

    return NextResponse.json({
      success: true,
      message: "Toutes les tables Supabase Cloud ont été synchronisées avec succès pour la Prod Bonnet Rouge !",
      stats: {
        users: seedUsers.length,
        studies: seedStudies.length,
        priceAudits: seedPriceAudits.length,
        merchAudits: seedMerchAudits.length,
        submissions: seedSubmissions.length
      }
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erreur lors du seed global";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}