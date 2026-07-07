import { getDB } from "./db";
import { DEMO_ACCOUNTS } from "./auth";
import { uid } from "./utils";
import type {
  MerchAudit,
  PriceAudit,
  Study,
  Submission,
  User,
} from "./types";

const REGIONS = ["Abidjan - Lagunes", "Bouaké - Vallée du Bandama", "San Pedro - Bas-Sassandra"];
const OUTLETS = ["Supermarché Prosuma Hayat", "Carrefour Marcory", "CDCI Yopougon", "Kiosque Adjamé", "Boutique de quartier Yopougon"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique Traditionnelle", "Kiosque"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const now = Date.now();
const day = 86_400_000;

// ---- Consumer Connect : guides d'entretien FrieslandCampina Côte d'Ivoire ----

const guideRetail: Study = {
  id: "guide_retail",
  title: "Consumer Connect — Grande distribution",
  description:
    "Guide d'entretien chef de rayon / manager (Auchan, Prosuma, Carrefour). Référencement, promotions, ruptures et réaction prix Bonnet Rouge.",
  category: "consumer",
  status: "published",
  createdBy: "u_manager",
  createdAt: now - 2 * day,
  updatedAt: now - day,
  questions: [
    {
      id: "gr_refs",
      type: "long_text",
      label: "Quelles sont les références les plus vendues en lait en poudre et lait concentré ?",
      required: true,
      sixp: "PRODUCT",
    },
    {
      id: "gr_nego",
      type: "single_choice",
      label: "Qui négocie le référencement et les têtes de gondole ?",
      required: true,
      options: ["Le siège", "Le magasin", "Les deux"],
      sixp: "PLACE",
    },
    {
      id: "gr_promo",
      type: "long_text",
      label: "Quelles marques (Bonnet Rouge, Peak, Loya) poussent le plus de promotions ?",
      required: true,
      sixp: "PROMOTION",
    },
    {
      id: "gr_rupture",
      type: "boolean",
      label: "Y a-t-it des ruptures de stock fréquentes ?",
      required: true,
      sixp: "PLACE",
    },
    {
      id: "gr_price_reaction",
      type: "long_text",
      label: "Comment les clients réagissent-ils à un changement de prix sur la boîte Bonnet Rouge ?",
      required: true,
      sixp: "PRICE",
    },
  ],
};

const guideConsumer: Study = {
  id: "guide_consumer",
  title: "Consumer Connect — Consommateurs",
  description:
    "Guide d'entretien consommateur en sortie de marché / point de vente. Critères de choix, confiance de marque et budget lait.",
  category: "consumer",
  status: "published",
  createdBy: "u_analyst",
  createdAt: now - 2 * day,
  updatedAt: now - day,
  questions: [
    {
      id: "gc_criteria",
      type: "single_choice",
      label: "Qu'est-ce qui compte le plus dans le choix du lait ?",
      required: true,
      options: ["Prix", "Marque (Ex: Bonnet Rouge)", "Format Sachet/Boîte", "Habitude familiale"],
      sixp: "PROPOSITION",
    },
    {
      id: "gc_trust",
      type: "boolean",
      label: "Y a-t-il une marque de confiance transmise par la famille ?",
      required: true,
      sixp: "PROPOSITION",
    },
    {
      id: "gc_budget",
      type: "single_choice",
      label: "Le budget mensuel alloué aux produits laitiers a-t-il changé récemment ?",
      required: true,
      options: ["A augmenté", "Est stable", "A diminué"],
      sixp: "PRICE",
    },
    {
      id: "gc_nps",
      type: "nps",
      label: "Recommanderiez-vous votre marque de lait actuelle ? (NPS)",
      required: true,
      sixp: "PROPOSITION",
    },
  ],
};

const STUDIES: Study[] = [guideRetail, guideConsumer];

function seedSubmissions(): Submission[] {
  const subs: Submission[] = [];
  const choiceVals = ["Prix", "Marque (Ex: Bonnet Rouge)", "Format Sachet/Boîte", "Habitude familiale"];
  const budgetVals = ["A augmenté", "Est stable", "A diminué"];
  
  for (let i = 0; i < 40; i++) {
    const started = now - (i % 14) * day - i * 3600_000;
    const dur = 120 + (i % 8) * 30;
    subs.push({
      id: uid("sub"),
      studyId: guideConsumer.id,
      studyTitle: guideConsumer.title,
      agentId: "agent_cedric_01",
      agentName: "Cédric Touré",
      startedAt: started,
      finishedAt: started + dur * 1000,
      durationSec: dur,
      geo: {
        lat: 5.3484 + (i % 5) * 0.01,
        lng: -3.9785 - (i % 5) * 0.01,
        accuracy: 10,
      },
      syncStatus: i % 5 === 0 ? "pending" : "synced",
      validation: i % 4 === 0 ? "submitted" : "validated",
      createdAt: started + dur * 1000,
      answers: [
        { questionId: "gc_criteria", value: pick(choiceVals, i) },
        { questionId: "gc_trust", value: i % 3 !== 0 },
        { questionId: "gc_budget", value: pick(budgetVals, i) },
        { questionId: "gc_nps", value: 8 + (i % 3) },
      ],
    });
  }
  return subs;
}

function seedPriceAudits(): PriceAudit[] {
  const out: PriceAudit[] = [];
  const productsOwn = ["Lait Concentré Sucré Bonnet Rouge 400g", "Lait en Poudre Bonnet Rouge Sachet 400g"];
  const productsComp = ["Lait Concentré Peak 170g", "Lait en Poudre Loya Sachet 400g", "Lait en Poudre Nido Boîte 400g"];
  
  for (let i = 0; i < 30; i++) {
    const own = i % 2 === 0;
    out.push({
      id: uid("pa"),
      outlet: pick(OUTLETS, i),
      channel: pick(CHANNELS, i),
      brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya", "Nido"], i),
      isOwnBrand: own,
      product: own ? pick(productsOwn, i) : pick(productsComp, i),
      price: own ? (i % 2 === 0 ? 750 : 1800) : (i % 3 === 0 ? 500 : 1900),
      promo: i % 5 === 0,
      available: i % 8 !== 0,
      facings: 3 + (i % 5),
      region: pick(REGIONS, i),
      agentId: "agent_cedric_01",
      agentName: "Cédric Touré",
      syncStatus: i % 4 === 0 ? "pending" : "synced",
      createdAt: now - (i % 12) * day,
    });
  }
  return out;
}

function seedMerchAudits(): MerchAudit[] {
  const out: MerchAudit[] = [];
  const positions: MerchAudit["shelfPosition"][] = ["eye", "top", "middle", "bottom"];
  
  for (let i = 0; i < 24; i++) {
    const own = i % 2 === 0;
    out.push({
      id: uid("ma"),
      outlet: pick(OUTLETS, i),
      channel: pick(CHANNELS, i),
      brand: own ? "Bonnet Rouge" : pick(["Peak", "Loya"], i),
      isOwnBrand: own,
      facings: own ? 6 + (i % 4) : 3 + (i % 3),
      shelfLengthCm: own ? 120 + (i % 4) * 20 : 60 + (i % 4) * 10,
      shelfPosition: own ? "eye" : pick(positions, i),
      outOfStock: i % 9 === 0,
      plvPresent: own || i % 4 === 0,
      activationPresent: own && i % 3 === 0,
      region: pick(REGIONS, i),
      agentId: "agent_cedric_01",
      agentName: "Cédric Touré",
      syncStatus: "synced",
      createdAt: now - (i % 10) * day,
    });
  }
  return out;
}

export async function seedIfEmpty(): Promise<void> {
  const db = getDB();

  const userCount = await db.users.count();
  if (userCount === 0) {
    const users: User[] = DEMO_ACCOUNTS.map(({ password: _pw, ...u }) => {
      void _pw;
      return u;
    });
    await db.users.bulkAdd(users);
  }

  await db.studies.bulkPut(STUDIES);
  if ((await db.submissions.count()) === 0)
    await db.submissions.bulkAdd(seedSubmissions());
  if ((await db.priceAudits.count()) === 0)
    await db.priceAudits.bulkAdd(seedPriceAudits());
  if ((await db.merchAudits.count()) === 0)
    await db.merchAudits.bulkAdd(seedMerchAudits());
}