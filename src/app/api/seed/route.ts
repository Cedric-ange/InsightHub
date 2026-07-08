import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uid } from "@/lib/utils";

const REGIONS = ["Abidjan", "Bouaké", "San Pedro"];
const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque Adjamé", "Boutique Yopougon"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Variables Supabase manquantes côté serveur." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const now = Date.now();
    const day = 86_400_000;

    // 👥 1. Comptes Utilisateurs FrieslandCampina uniques & sécurisés
    const seedUsers = [
      { id: "agent_cedric_01", name: "Cédric Touré", email: "cedric.toure@frieslandcampina.com", role: "admin", password: "FC_Admin_Abidjan2026!" },
      { id: "agent_patrick_02", name: "Patrick Epée", email: "patrick.epee@frieslandcampina.com", role: "manager", password: "FC_Manager_Epee2026*" },
      { id: "agent_dian_03", name: "Dian Delaure", email: "dian.delaure@frieslandcampina.com", role: "analyst", password: "FC_Analyst_Delaure!" },
      { id: "agent_marie_04", name: "Marie Jeanne", email: "marie.jeanne@frieslandcampina.com", role: "supervisor", password: "FC_Super_Marie2026" },
      { id: "agent_terrain_02", name: "Test User", email: "user.test@frieslandcampina.com", role: "field", password: "demo" }
    ];

    // 📋 2. Catalogue Complet des Questionnaires Métiers (FrieslandCampina)
    const guideRetail = {
      id: "guide_retail",
      title: "Consumer Connect — Grande distribution",
      description: "Guide d'entretien chef de rayon / manager (Auchan, Prosuma, Carrefour). Référencement, promotions, ruptures et réaction prix.",
      category: "consumer",
      status: "published",
      createdAt: now - 2 * day,
      updatedAt: now - day,
      questions: [
        { id: "gr_refs", type: "long_text", label: "Quelles sont les références les plus vendues en lait en poudre, évaporé et UHT ?", required: true, sixp: "PRODUCT" },
        { id: "gr_nego", type: "single_choice", label: "Who negotiates referencing and gondola heads?", required: true, options: ["Le siège", "Le magasin", "Les deux"], sixp: "PLACE" },
        { id: "gr_promo", type: "long_text", label: "Quelles marques poussent le plus de promotions (2-for-1, prix barré) et à quelle fréquence ?", required: true, sixp: "PROMOTION" },
        { id: "gr_rupture", type: "boolean", label: "Y a-t-il des ruptures de stock fréquentes ?", required: true, sixp: "PLACE" },
        { id: "gr_price_reaction", type: "long_text", label: "Comment les clients réagissent-ils à un changement de prix sur le lait ?", required: true, sixp: "PRICE" }
      ]
    };

    const guideTraditional = {
      id: "guide_traditional",
      title: "Consumer Connect — Marché traditionnel / boutique",
      description: "Guide d'entretien commerçant / grossiste de quartier. Formats, approvisionnement, réassort et appui commercial.",
      category: "consumer",
      status: "published",
      createdAt: now - 2 * day,
      updatedAt: now - day,
      questions: [
        { id: "gt_formats", type: "multi_choice", label: "Quels formats se vendent le mieux ?", required: true, options: ["Sachet", "Boîte", "Pack"], sixp: "PACK" },
        { id: "gt_supply", type: "single_choice", label: "Comment vous approvisionnez-vous ?", required: true, options: ["Directement chez le distributeur", "Via un grossiste intermédiaire", "Les deux"], sixp: "PLACE" },
        { id: "gt_restock", type: "text", label: "Quel est le délai et la fréquence de réassort ?", required: true, sixp: "PLACE" },
        { id: "gt_brand_ask", type: "single_choice", label: "Les clients demandent-ils une marque précise ?", required: true, options: ["Une marque précise", "Le moins cher disponible", "Cela dépend"], sixp: "PROPOSITION" }
      ]
    };

    const guideDistributor = {
      id: "guide_distributor",
      title: "Consumer Connect — Distributeur / importateur",
      description: "Guide d'entretien distributeur / importateur. Volumes, saisonnalité, marges par échelon et barrières logistiques.",
      category: "consumer",
      status: "published",
      createdAt: now - 2 * day,
      updatedAt: now - day,
      questions: [
        { id: "gd_volumes", type: "long_text", label: "Quels sont les volumes et la saisonnalité de la demande (Ramadan, rentrée scolaire, etc.) ?", required: true, sixp: "PLACE" },
        { id: "gd_margins", type: "long_text", label: "Quelles sont les marges pratiquées à chaque échelon (import → grossiste → détaillant) ?", required: true, sixp: "PRICE" },
        { id: "gd_barriers", type: "long_text", label: "Quelles barrières logistiques ou douanières freinent le plus l'activité ?", required: true, sixp: "PLACE" }
      ]
    };

    const guideConsumer = {
      id: "guide_consumer",
      title: "Consumer Connect — Consommateurs",
      description: "Guide d'entretien consommateur en sortie de marché / point de vente. Critères de choix, usage, confiance de marque et budget.",
      category: "consumer",
      status: "published",
      createdAt: now - 2 * day,
      updatedAt: now - day,
      questions: [
        { id: "gc_criteria", type: "single_choice", label: "Qu'est-ce qui compte le plus dans le choix ?", required: true, options: ["Prix", "Marque", "Format", "Habitude familiale"], sixp: "PROPOSITION" },
        { id: "gc_usage", type: "long_text", label: "Le lait en poudre est-il perçu différemment de l'UHT en termes d'usage ?", required: false, sixp: "PRODUCT" },
        { id: "gc_budget", type: "single_choice", label: "Le budget mensuel alloué aux produits laitiers a-t-il changé récemment ?", required: true, options: ["A augmenté", "Est stable", "A diminué"], sixp: "PRICE" },
        { id: "gc_nps", type: "nps", label: "Recommanderiez-vous votre marque de lait actuelle ? (NPS)", required: true, sixp: "PROPOSITION" }
      ]
    };

    const tasteStudy = {
      id: "study_taste",
      title: "Dégustation nouvelle marque Biscuit",
      description: "Test de dégustation d'un nouveau biscuit avant lancement. Évaluation goût, texture, emballage et intention d'achat.",
      category: "taste_test",
      status: "published",
      createdAt: now - 10 * day,
      updatedAt: now - 3 * day,
      questions: [
        { id: "q_taste_like", type: "single_choice", label: "Avez-vous apprécié le goût ?", required: true, options: ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"], sixp: "PRODUCT" },
        { id: "q_taste_texture", type: "rating", label: "Notez la texture (1 à 10)", required: true, min: 1, max: 10, sixp: "PRODUCT" },
        { id: "q_taste_price", type: "boolean", label: "Le prix proposé (500 FCFA) est-il acceptable ?", required: true, sixp: "PRICE" }
      ]
    };

    const STUDIES = [guideRetail, guideTraditional, guideDistributor, guideConsumer, tasteStudy];

    // 📊 3. Séquence de Génération des Soumissions (40 lignes)
    const seedSubmissions = [];
    const likeVals = ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"];
    for (let i = 0; i < 40; i++) {
      const started = now - (i % 14) * day - i * 3600_000;
      const dur = 120 + (i % 8) * 30;
      seedSubmissions.push({
        id: uid("sub"),
        studyId: "study_taste",
        studyTitle: "Dégustation nouvelle marque Biscuit",
        agentId: "agent_terrain_02",
        agentName: "Amadou Koné",
        startedAt: started,
        finishedAt: started + dur * 1000,
        durationSec: dur,
        geo: { lat: 5.32 + (i % 5) * 0.05, lng: -4.02 - (i % 5) * 0.04, accuracy: 12 },
        syncStatus: "synced",
        validation: i % 5 === 0 ? "submitted" : "validated",
        createdAt: started + dur * 1000,
        answers: [
          { questionId: "q_taste_like", value: pick(likeVals, i) },
          { questionId: "q_taste_texture", value: 5 + (i % 6) },
          { questionId: "q_taste_price", value: i % 3 !== 0 }
        ]
      });
    }

    // 💵 4. Séquence Audits des Prix Bonnet Rouge vs Concurrence (30 lignes)
    const seedPriceAudits = [];
    const products = ["Lait Bonnet Rouge 160g", "Lait Poudre Bonnet Rouge 900g", "Format Sachet Bonnet Rouge"];
    for (let i = 0; i < 30; i++) {
      const own = i % 2 === 0;
      seedPriceAudits.push({
        id: uid("pa"),
        outlet: pick(OUTLETS, i),
        channel: pick(CHANNELS, i),
        brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya", "Nido"], i),
        isOwnBrand: own,
        product: pick(products, i),
        price: own ? 750 + (i % 5) * 10 : 720 + (i % 7) * 20,
        promo: i % 4 === 0,
        available: i % 6 !== 0,
        facings: 2 + (i % 6),
        region: pick(REGIONS, i),
        agentId: "agent_terrain_02",
        agentName: "Amadou Koné",
        syncStatus: "synced",
        createdAt: now - (i % 12) * day
      });
    }

    // 📦 5. Séquence Audits Merchandising (24 lignes)
    const seedMerchAudits = [];
    const positions = ["eye", "top", "middle", "bottom"];
    for (let i = 0; i < 24; i++) {
      const own = i % 2 === 0;
      seedMerchAudits.push({
        id: uid("ma"),
        outlet: pick(OUTLETS, i),
        channel: pick(CHANNELS, i),
        brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya"], i),
        isOwnBrand: own,
        facings: own ? 4 + (i % 5) : 3 + (i % 6),
        shelfLengthCm: 50 + (i % 8) * 15,
        shelfPosition: pick(positions, i),
        outOfStock: i % 7 === 0,
        plvPresent: i % 3 === 0,
        activationPresent: i % 5 === 0,
        region: pick(REGIONS, i),
        agentId: "agent_terrain_02",
        agentName: "Amadou Koné",
        syncStatus: "synced",
        createdAt: now - (i % 10) * day
      });
    }

    // 🔥 EXECUTION DE LA PURGE ET RE-REMPLISSAGE DANS SUPABASE CLOUD
    await supabase.from("users").delete().neq("id", "keep_all");
    await supabase.from("studies").delete().neq("id", "keep_all");
    await supabase.from("submissions").delete().neq("id", "keep_all");
    await supabase.from("price_audits").delete().neq("id", "keep_all");
    await supabase.from("merch_audits").delete().neq("id", "keep_all");

    await supabase.from("users").insert(seedUsers);
    await supabase.from("studies").insert(STUDIES);
    await supabase.from("submissions").insert(seedSubmissions);
    await supabase.from("price_audits").insert(seedPriceAudits);
    await supabase.from("merch_audits").insert(seedMerchAudits);

    return NextResponse.json({
      success: true,
      message: "Toutes les études Consumer Connect et audits laitiers FrieslandCampina ont été injectés !",
      stats: {
        users: seedUsers.length,
        studies: STUDIES.length,
        priceAudits: seedPriceAudits.length,
        merchAudits: seedMerchAudits.length,
        submissions: seedSubmissions.length
      }
    });

  } catch {
    return NextResponse.json({ error: "Échec de l'exécution du seed." }, { status: 500 });
  }
}