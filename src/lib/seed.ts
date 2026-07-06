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

const REGIONS = ["Abidjan", "Bouaké", "San Pedro"];
const OUTLETS = ["Prosuma", "Carrefour", "CDCI", "Kiosque Adjamé", "Boutique Yopougon"];
const CHANNELS = ["Hypermarché", "Supermarché", "Boutique", "Kiosque"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const now = Date.now();
const day = 86_400_000;

const tasteStudy: Study = {
  id: "study_taste",
  title: "Dégustation nouvelle marque Biscuit",
  description:
    "Test de dégustation d'un nouveau biscuit avant lancement. Évaluation goût, texture, emballage et intention d'achat.",
  category: "taste_test",
  status: "published",
  createdBy: "u_analyst",
  createdAt: now - 10 * day,
  updatedAt: now - 3 * day,
  questions: [
    {
      id: "q_taste_like",
      type: "single_choice",
      label: "Avez-vous apprécié le goût ?",
      required: true,
      options: ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"],
      sixp: "PRODUCT",
    },
    {
      id: "q_taste_texture",
      type: "rating",
      label: "Notez la texture (1 à 10)",
      required: true,
      min: 1,
      max: 10,
      sixp: "PRODUCT",
    },
    {
      id: "q_taste_pack",
      type: "rating",
      label: "Notez l'emballage (1 à 10)",
      required: true,
      min: 1,
      max: 10,
      sixp: "PACK",
    },
    {
      id: "q_taste_brand",
      type: "text",
      label: "Quelle marque achetez-vous habituellement ?",
      required: false,
      sixp: "PROPOSITION",
    },
    {
      id: "q_taste_price",
      type: "boolean",
      label: "Le prix proposé (500 FCFA) est-il acceptable ?",
      required: true,
      sixp: "PRICE",
    },
    {
      id: "q_taste_intent",
      type: "single_choice",
      label: "Intention d'achat",
      required: true,
      options: ["Certainement", "Probablement", "Peut-être", "Non"],
      sixp: "PROPOSITION",
    },
    {
      id: "q_taste_photo",
      type: "photo",
      label: "Photo du répondant (optionnel)",
      required: false,
    },
  ],
};

const homeStudy: Study = {
  id: "study_home",
  title: "Visite Consommateur à Domicile",
  description:
    "Comprendre les habitudes, la fréquence et le stockage des produits au domicile (module 6P).",
  category: "home_visit",
  status: "published",
  createdBy: "u_analyst",
  createdAt: now - 8 * day,
  updatedAt: now - 2 * day,
  questions: [
    {
      id: "q_home_sex",
      type: "single_choice",
      label: "Sexe du chef de ménage",
      required: true,
      options: ["Homme", "Femme"],
    },
    {
      id: "q_home_age",
      type: "number",
      label: "Âge",
      required: true,
      min: 15,
      max: 99,
    },
    {
      id: "q_home_income",
      type: "select",
      label: "Tranche de revenu mensuel",
      required: true,
      options: ["< 100 000", "100 000 - 300 000", "> 300 000"],
    },
    {
      id: "q_home_brands",
      type: "multi_choice",
      label: "Marques consommées",
      required: true,
      options: ["Notre marque", "Nestlé", "Concurrent local", "Autre"],
      sixp: "PROPOSITION",
    },
    {
      id: "q_home_freq",
      type: "single_choice",
      label: "Fréquence d'achat",
      required: true,
      options: ["Hebdomadaire", "Mensuelle"],
    },
    {
      id: "q_home_kitchen",
      type: "photo",
      label: "Photo cuisine / produits présents",
      required: false,
    },
    {
      id: "q_home_gps",
      type: "gps",
      label: "Localisation du domicile",
      required: true,
      sixp: "PLACE",
    },
  ],
};

const availStudy: Study = {
  id: "study_avail",
  title: "Audit disponibilité & part de linéaire",
  description: "Relevé rapide de disponibilité produit et NPS distributeur.",
  category: "availability",
  status: "published",
  createdBy: "u_manager",
  createdAt: now - 6 * day,
  updatedAt: now - day,
  questions: [
    {
      id: "q_av_outlet",
      type: "select",
      label: "Point de vente",
      required: true,
      options: OUTLETS,
      sixp: "PLACE",
    },
    {
      id: "q_av_available",
      type: "boolean",
      label: "Notre produit est-il disponible ?",
      required: true,
      sixp: "PLACE",
    },
    {
      id: "q_av_nps",
      type: "nps",
      label: "Recommanderiez-vous ce distributeur ? (NPS)",
      required: true,
      sixp: "PROPOSITION",
    },
  ],
};

const STUDIES: Study[] = [tasteStudy, homeStudy, availStudy];

function seedSubmissions(): Submission[] {
  const subs: Submission[] = [];
  const likeVals = ["Très satisfait", "Satisfait", "Moyen", "Insatisfait"];
  const intentVals = ["Certainement", "Probablement", "Peut-être", "Non"];
  for (let i = 0; i < 40; i++) {
    const started = now - (i % 14) * day - i * 3600_000;
    const dur = 120 + (i % 8) * 30;
    subs.push({
      id: uid("sub"),
      studyId: tasteStudy.id,
      studyTitle: tasteStudy.title,
      agentId: "u_agent",
      agentName: "Moussa Traoré",
      startedAt: started,
      finishedAt: started + dur * 1000,
      durationSec: dur,
      geo: {
        lat: 5.32 + (i % 5) * 0.05,
        lng: -4.02 - (i % 5) * 0.04,
        accuracy: 12,
      },
      syncStatus: i % 9 === 0 ? "pending" : "synced",
      validation: i % 5 === 0 ? "submitted" : "validated",
      createdAt: started + dur * 1000,
      answers: [
        { questionId: "q_taste_like", value: pick(likeVals, i) },
        { questionId: "q_taste_texture", value: 5 + (i % 6) },
        { questionId: "q_taste_pack", value: 6 + (i % 5) },
        { questionId: "q_taste_brand", value: "Nestlé" },
        { questionId: "q_taste_price", value: i % 3 !== 0 },
        { questionId: "q_taste_intent", value: pick(intentVals, i) },
      ],
    });
  }
  return subs;
}

function seedPriceAudits(): PriceAudit[] {
  const out: PriceAudit[] = [];
  const products = ["Biscuit 16g", "Biscuit 900g", "Chocolat 100g"];
  for (let i = 0; i < 30; i++) {
    const own = i % 2 === 0;
    out.push({
      id: uid("pa"),
      outlet: pick(OUTLETS, i),
      channel: pick(CHANNELS, i),
      brand: own ? "Notre marque" : pick(["Nestlé", "Concurrent A", "Concurrent B"], i),
      isOwnBrand: own,
      product: pick(products, i),
      price: own ? 480 + (i % 5) * 10 : 450 + (i % 7) * 20,
      promo: i % 4 === 0,
      available: i % 6 !== 0,
      facings: 2 + (i % 6),
      region: pick(REGIONS, i),
      agentId: "u_agent",
      agentName: "Moussa Traoré",
      syncStatus: i % 8 === 0 ? "pending" : "synced",
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
      brand: own ? "Notre marque" : pick(["Nestlé", "Concurrent local"], i),
      isOwnBrand: own,
      facings: own ? 3 + (i % 5) : 5 + (i % 6),
      shelfLengthCm: 40 + (i % 8) * 15,
      shelfPosition: pick(positions, i),
      outOfStock: i % 7 === 0,
      plvPresent: i % 3 === 0,
      activationPresent: i % 5 === 0,
      region: pick(REGIONS, i),
      agentId: "u_agent",
      agentName: "Moussa Traoré",
      syncStatus: "synced",
      createdAt: now - (i % 10) * day,
    });
  }
  return out;
}

// Populate IndexedDB with demo data on first launch (idempotent per table).
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

  if ((await db.studies.count()) === 0) await db.studies.bulkAdd(STUDIES);
  if ((await db.submissions.count()) === 0)
    await db.submissions.bulkAdd(seedSubmissions());
  if ((await db.priceAudits.count()) === 0)
    await db.priceAudits.bulkAdd(seedPriceAudits());
  if ((await db.merchAudits.count()) === 0)
    await db.merchAudits.bulkAdd(seedMerchAudits());
}
