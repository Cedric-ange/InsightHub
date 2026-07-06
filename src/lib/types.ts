// Domain model for InsightHub — Field Intelligence Platform (FIP)

export type Role =
  | "ADMIN"
  | "MANAGER"
  | "ANALYST"
  | "SUPERVISOR"
  | "FIELD_AGENT";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  ANALYST: "Analyste",
  SUPERVISOR: "Superviseur Terrain",
  FIELD_AGENT: "Enquêteur",
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  region?: string;
  active: boolean;
  createdAt: number;
}

export type QuestionType =
  | "text"
  | "long_text"
  | "number"
  | "date"
  | "time"
  | "boolean"
  | "select"
  | "single_choice"
  | "multi_choice"
  | "nps"
  | "rating"
  | "ranking"
  | "signature"
  | "photo"
  | "audio"
  | "video"
  | "qr"
  | "barcode"
  | "gps";

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Texte libre",
  long_text: "Texte long",
  number: "Numérique",
  date: "Date",
  time: "Heure",
  boolean: "Oui / Non",
  select: "Liste déroulante",
  single_choice: "Choix unique",
  multi_choice: "Choix multiple",
  nps: "NPS (0-10)",
  rating: "Échelle de notation",
  ranking: "Classement",
  signature: "Signature",
  photo: "Photo",
  audio: "Audio",
  video: "Vidéo",
  qr: "Scan QR Code",
  barcode: "Scan Code-barres",
  gps: "GPS",
};

// 6P model (Product, Price, Place, Promotion, Pack, Proposition) feeding IBP.
export type SixP =
  | "PRODUCT"
  | "PRICE"
  | "PLACE"
  | "PROMOTION"
  | "PACK"
  | "PROPOSITION";

export const SIXP_LABELS: Record<SixP, string> = {
  PRODUCT: "Product",
  PRICE: "Price",
  PLACE: "Place",
  PROMOTION: "Promotion",
  PACK: "Pack",
  PROPOSITION: "Proposition",
};

export interface QuestionCondition {
  // Show this question only when the referenced question has one of these values.
  questionId: string;
  equals: string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[]; // for choice/select/ranking
  min?: number; // for number/rating
  max?: number;
  sixp?: SixP; // maps the answer to a 6P pillar
  condition?: QuestionCondition; // logical jump / conditional display
}

export type StudyCategory =
  | "consumer"
  | "concept_test"
  | "taste_test"
  | "product_launch"
  | "price_audit"
  | "merchandising"
  | "availability"
  | "visibility"
  | "satisfaction"
  | "home_visit"
  | "shopper"
  | "competition";

export const STUDY_CATEGORY_LABELS: Record<StudyCategory, string> = {
  consumer: "Études consommateurs",
  concept_test: "Test de concept",
  taste_test: "Test de dégustation",
  product_launch: "Lancement produit",
  price_audit: "Audit de prix",
  merchandising: "Relevé merchandising",
  availability: "Disponibilité produit",
  visibility: "Visibilité magasin",
  satisfaction: "Enquête de satisfaction",
  home_visit: "Visite à domicile",
  shopper: "Étude shopper",
  competition: "Tracking concurrence",
};

export type StudyStatus = "draft" | "published" | "archived";

export interface Study {
  id: string;
  title: string;
  description?: string;
  category: StudyCategory;
  status: StudyStatus;
  questions: Question[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export type SyncStatus = "pending" | "synced" | "error";

// Validation workflow: Enquêteur -> Superviseur -> Validation -> Publication.
export type ValidationStatus = "submitted" | "validated" | "rejected";

export interface Answer {
  questionId: string;
  value: string | number | boolean | string[] | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface Submission {
  id: string;
  studyId: string;
  studyTitle: string;
  agentId: string;
  agentName: string;
  answers: Answer[];
  geo?: GeoPoint;
  startedAt: number;
  finishedAt: number;
  durationSec: number;
  syncStatus: SyncStatus;
  validation: ValidationStatus;
  createdAt: number;
}

// ---- Specialised field records (richer dashboards) ----

export interface PriceAudit {
  id: string;
  outlet: string;
  channel: string;
  brand: string;
  isOwnBrand: boolean;
  product: string;
  price: number;
  promo: boolean;
  available: boolean;
  facings?: number;
  region?: string;
  photo?: string; // data URL
  geo?: GeoPoint;
  agentId: string;
  agentName: string;
  syncStatus: SyncStatus;
  createdAt: number;
}

export interface MerchAudit {
  id: string;
  outlet: string;
  channel: string;
  brand: string;
  isOwnBrand: boolean;
  facings: number;
  shelfLengthCm: number;
  shelfPosition: "eye" | "top" | "middle" | "bottom";
  outOfStock: boolean;
  plvPresent: boolean;
  activationPresent: boolean;
  region?: string;
  photoBefore?: string;
  photoAfter?: string;
  geo?: GeoPoint;
  agentId: string;
  agentName: string;
  syncStatus: SyncStatus;
  createdAt: number;
}
