import type { SixP } from "./types";

export interface Insight {
  pillar: SixP | "GENERAL";
  surface: string; // observed symptom
  rootCause: string; // likely driver
  recommendation: string; // suggested action
  severity: "high" | "medium" | "low";
}

export interface InsightInputs {
  availabilityRate: number; // 0..1 share of audited outlets in stock
  ownPriceIndex: number; // 100 = parity with competition
  purchaseIntent: number; // 0..1
  visibilityRate: number; // 0..1 share of shelf / facings for own brand
  satisfaction: number; // 0..1
  region?: string;
}

// Automatically derive IBP-ready insights (Surface issue -> Root cause ->
// Recommendation) from aggregated 6P signals. This is the "Nielsen/Kantar
// interne" logic described in the cahier des charges.
export function generateInsights(i: InsightInputs): Insight[] {
  const region = i.region ?? "la zone pilote";
  const out: Insight[] = [];

  if (i.availabilityRate < 0.8) {
    const rupture = Math.round((1 - i.availabilityRate) * 100);
    out.push({
      pillar: "PLACE",
      surface: "Part de marché terrain sous pression",
      rootCause: `Perte de disponibilité : ${rupture}% des points de vente audités à ${region} sont en rupture.`,
      recommendation:
        "Renforcer l'approvisionnement des magasins à plus forte rotation et sécuriser la chaîne logistique.",
      severity: i.availabilityRate < 0.6 ? "high" : "medium",
    });
  }

  if (i.purchaseIntent > 0.7 && i.visibilityRate < 0.5) {
    out.push({
      pillar: "PROMOTION",
      surface: "Fort potentiel non converti en magasin",
      rootCause: `Intention d'achat élevée (${Math.round(
        i.purchaseIntent * 100,
      )}%) mais visibilité faible (${Math.round(i.visibilityRate * 100)}%).`,
      recommendation:
        "Déployer PLV et activations sur les points de vente clés pour convertir l'intérêt en ventes.",
      severity: "high",
    });
  }

  if (i.ownPriceIndex > 108) {
    out.push({
      pillar: "PRICE",
      surface: "Positionnement prix premium",
      rootCause: `Indice prix à ${Math.round(
        i.ownPriceIndex,
      )} vs concurrence (base 100).`,
      recommendation:
        "Vérifier l'élasticité prix et l'exécution promo ; ajuster si la valeur perçue ne justifie pas l'écart.",
      severity: i.ownPriceIndex > 115 ? "medium" : "low",
    });
  }

  if (i.satisfaction < 0.6) {
    out.push({
      pillar: "PRODUCT",
      surface: "Satisfaction consommateur en retrait",
      rootCause: `Score de satisfaction à ${Math.round(
        i.satisfaction * 100,
      )}% sur les études terrain.`,
      recommendation:
        "Analyser les verbatims (goût, packaging) et prioriser les axes produit dans le plan Brand.",
      severity: i.satisfaction < 0.45 ? "high" : "medium",
    });
  }

  if (out.length === 0) {
    out.push({
      pillar: "GENERAL",
      surface: "Performance marché saine",
      rootCause:
        "Disponibilité, prix, visibilité et satisfaction dans les seuils cibles.",
      recommendation:
        "Maintenir l'exécution et surveiller les signaux concurrence dans le prochain cycle IBP.",
      severity: "low",
    });
  }

  return out;
}
