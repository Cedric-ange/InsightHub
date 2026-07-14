import { NextResponse } from "next/server";
import { getSql } from "@/lib/pg";

export const dynamic = "force-dynamic";

// Catalogue de questionnaires Consumer Connect (FrieslandCampina — Bonnet Rouge).
// Ce endpoint est idempotent : il fait un UPSERT des études, sans purge et sans
// injecter de données de collecte fictives (les soumissions/audits proviennent
// exclusivement du terrain via /api/sync).
const now = Date.now();
const day = 86_400_000;

const STUDIES = [
  {
    id: "guide_retail",
    title: "Consumer Connect — Grande distribution",
    description:
      "Guide d'entretien chef de rayon / manager (Auchan, Prosuma, Carrefour). Référencement, promotions, ruptures et réaction prix.",
    category: "consumer",
    status: "published",
    createdAt: now - 2 * day,
    updatedAt: now - day,
    questions: [
      { id: "gr_refs", type: "long_text", label: "Quelles sont les références les plus vendues en lait en poudre, évaporé et UHT ?", required: true, sixp: "PRODUCT" },
      { id: "gr_nego", type: "single_choice", label: "Qui négocie le référencement et les têtes de gondole ?", required: true, options: ["Le siège", "Le magasin", "Les deux"], sixp: "PLACE" },
      { id: "gr_promo", type: "long_text", label: "Quelles marques poussent le plus de promotions (2-for-1, prix barré) et à quelle fréquence ?", required: true, sixp: "PROMOTION" },
      { id: "gr_rupture", type: "boolean", label: "Y a-t-il des ruptures de stock fréquentes ?", required: true, sixp: "PLACE" },
      { id: "gr_rupture_brands", type: "text", label: "Sur quelles marques ?", required: false, sixp: "PLACE", condition: { questionId: "gr_rupture", equals: ["true"] } },
      { id: "gr_price_reaction", type: "long_text", label: "Comment les clients réagissent-ils à un changement de prix sur le lait ?", required: true, sixp: "PRICE" },
    ],
  },
  {
    id: "guide_traditional",
    title: "Consumer Connect — Marché traditionnel / boutique",
    description:
      "Guide d'entretien commerçant / grossiste de quartier. Formats, approvisionnement, réassort et appui commercial.",
    category: "consumer",
    status: "published",
    createdAt: now - 2 * day,
    updatedAt: now - day,
    questions: [
      { id: "gt_formats", type: "multi_choice", label: "Quels formats se vendent le mieux ?", required: true, options: ["Sachet", "Boîte", "Pack"], sixp: "PACK" },
      { id: "gt_supply", type: "single_choice", label: "Comment vous approvisionnez-vous ?", required: true, options: ["Directement chez le distributeur", "Via un grossiste intermédiaire", "Les deux"], sixp: "PLACE" },
      { id: "gt_restock", type: "text", label: "Quel est le délai et la fréquence de réassort ?", required: true, sixp: "PLACE" },
      { id: "gt_brand_ask", type: "single_choice", label: "Les clients demandent-ils une marque précise ?", required: true, options: ["Une marque précise", "Le moins cher disponible", "Cela dépend"], sixp: "PROPOSITION" },
    ],
  },
  {
    id: "guide_distributor",
    title: "Consumer Connect — Distributeur / importateur",
    description:
      "Guide d'entretien distributeur / importateur. Volumes, saisonnalité, marges par échelon et barrières logistiques.",
    category: "consumer",
    status: "published",
    createdAt: now - 2 * day,
    updatedAt: now - day,
    questions: [
      { id: "gd_volumes", type: "long_text", label: "Quels sont les volumes et la saisonnalité de la demande (Ramadan, rentrée scolaire, etc.) ?", required: true, sixp: "PLACE" },
      { id: "gd_margins", type: "long_text", label: "Quelles sont les marges pratiquées à chaque échelon (import → grossiste → détaillant) ?", required: true, sixp: "PRICE" },
      { id: "gd_barriers", type: "long_text", label: "Quelles barrières logistiques ou douanières freinent le plus l'activité ?", required: true, sixp: "PLACE" },
    ],
  },
  {
    id: "guide_consumer",
    title: "Consumer Connect — Consommateurs",
    description:
      "Guide d'entretien consommateur en sortie de marché / point de vente. Critères de choix, usage, confiance de marque et budget.",
    category: "consumer",
    status: "published",
    createdAt: now - 2 * day,
    updatedAt: now - day,
    questions: [
      { id: "gc_criteria", type: "single_choice", label: "Qu'est-ce qui compte le plus dans le choix ?", required: true, options: ["Prix", "Marque", "Format", "Habitude familiale"], sixp: "PROPOSITION" },
      { id: "gc_usage", type: "long_text", label: "Le lait en poudre est-il perçu différemment de l'UHT en termes d'usage (thé/café vs boisson) ?", required: false, sixp: "PRODUCT" },
      { id: "gc_budget", type: "single_choice", label: "Le budget mensuel alloué aux produits laitiers a-t-il changé récemment ?", required: true, options: ["A augmenté", "Est stable", "A diminué"], sixp: "PRICE" },
      { id: "gc_nps", type: "nps", label: "Recommanderiez-vous votre marque de lait actuelle ? (NPS)", required: true, sixp: "PROPOSITION" },
    ],
  },
];

export async function GET() {
  try {
    const sql = getSql();

    for (const s of STUDIES) {
      await sql`
        INSERT INTO studies (id, title, description, category, status, questions, created_at, updated_at)
        VALUES (${s.id}, ${s.title}, ${s.description}, ${s.category}, ${s.status}, ${sql.json(s.questions)}, ${s.createdAt}, ${s.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          title = excluded.title, description = excluded.description,
          category = excluded.category, status = excluded.status,
          questions = excluded.questions, updated_at = excluded.updated_at
      `;
    }

    return NextResponse.json({ success: true, studies: STUDIES.length });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Échec du seed";
    console.error("GET /api/seed:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
