import type { MerchAudit, PriceAudit, Submission } from "./types";

export interface KPISet {
  interviews: number;
  regionsCovered: number;
  avgOwnPrice: number;
  priceIndex: number; // own vs competition, base 100
  availabilityRate: number; // 0..1
  shareOfShelf: number; // 0..1 own facings / total
  satisfaction: number; // 0..1
  purchaseIntent: number; // 0..1
  nps: number; // -100..100
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function computeKPIs(
  submissions: Submission[],
  price: PriceAudit[],
  merch: MerchAudit[],
): KPISet {
  const regions = new Set<string>();
  price.forEach((p) => p.region && regions.add(p.region));
  merch.forEach((m) => m.region && regions.add(m.region));

  const ownPrices = price.filter((p) => p.isOwnBrand).map((p) => p.price);
  const compPrices = price.filter((p) => !p.isOwnBrand).map((p) => p.price);
  const avgOwn = mean(ownPrices);
  const avgComp = mean(compPrices);
  const priceIndex = avgComp > 0 ? (avgOwn / avgComp) * 100 : 100;

  const availabilityRate =
    price.length > 0 ? price.filter((p) => p.available).length / price.length : 0;

  const ownFacings = merch
    .filter((m) => m.isOwnBrand)
    .reduce((a, m) => a + m.facings, 0);
  const totalFacings = merch.reduce((a, m) => a + m.facings, 0);
  const shareOfShelf = totalFacings > 0 ? ownFacings / totalFacings : 0;

  // Satisfaction & purchase intent from taste-test submissions.
  const satVals: number[] = [];
  const intentVals: number[] = [];
  const npsVals: number[] = [];
  const satMap: Record<string, number> = {
    "Très satisfait": 1,
    Satisfait: 0.75,
    Moyen: 0.5,
    Insatisfait: 0.2,
  };
  const intentMap: Record<string, number> = {
    Certainement: 1,
    Probablement: 0.75,
    "Peut-être": 0.4,
    Non: 0,
  };
  submissions.forEach((s) => {
    s.answers.forEach((a) => {
      if (a.questionId === "q_taste_like" && typeof a.value === "string") {
        const v = satMap[a.value];
        if (v != null) satVals.push(v);
      }
      if (a.questionId === "q_taste_intent" && typeof a.value === "string") {
        const v = intentMap[a.value];
        if (v != null) intentVals.push(v);
      }
      if (a.questionId === "q_av_nps" && typeof a.value === "number") {
        npsVals.push(a.value);
      }
    });
  });

  const promoters = npsVals.filter((n) => n >= 9).length;
  const detractors = npsVals.filter((n) => n <= 6).length;
  const nps =
    npsVals.length > 0
      ? ((promoters - detractors) / npsVals.length) * 100
      : 0;

  return {
    interviews: submissions.length,
    regionsCovered: regions.size,
    avgOwnPrice: avgOwn,
    priceIndex,
    availabilityRate,
    shareOfShelf,
    satisfaction: mean(satVals),
    purchaseIntent: mean(intentVals),
    nps,
  };
}

export interface TrendPoint {
  label: string;
  interviews: number;
}

// Interviews per day over the last `days` days.
export function interviewsTrend(
  submissions: Submission[],
  days = 14,
): TrendPoint[] {
  const now = Date.now();
  const day = 86_400_000;
  const buckets: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = now - i * day;
    const d = new Date(start);
    const label = d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    const count = submissions.filter((s) => {
      const diff = Math.floor((now - s.createdAt) / day);
      return diff === i;
    }).length;
    buckets.push({ label, interviews: count });
  }
  return buckets;
}

export interface PriceComparison {
  brand: string;
  avgPrice: number;
  index: number;
  isOwn: boolean;
}

export function priceByBrand(price: PriceAudit[]): PriceComparison[] {
  const byBrand = new Map<string, { sum: number; n: number; own: boolean }>();
  price.forEach((p) => {
    const cur = byBrand.get(p.brand) ?? { sum: 0, n: 0, own: p.isOwnBrand };
    cur.sum += p.price;
    cur.n += 1;
    byBrand.set(p.brand, cur);
  });
  const own = [...byBrand.entries()].find(([, v]) => v.own);
  const ownAvg = own ? own[1].sum / own[1].n : 0;
  return [...byBrand.entries()]
    .map(([brand, v]) => {
      const avg = v.sum / v.n;
      return {
        brand,
        avgPrice: avg,
        index: ownAvg > 0 ? (avg / ownAvg) * 100 : 100,
        isOwn: v.own,
      };
    })
    .sort((a, b) => a.avgPrice - b.avgPrice);
}

export interface ShelfShare {
  brand: string;
  facings: number;
  share: number;
}

export function shelfShareByBrand(merch: MerchAudit[]): ShelfShare[] {
  const total = merch.reduce((a, m) => a + m.facings, 0);
  const byBrand = new Map<string, number>();
  merch.forEach((m) => byBrand.set(m.brand, (byBrand.get(m.brand) ?? 0) + m.facings));
  return [...byBrand.entries()]
    .map(([brand, facings]) => ({
      brand,
      facings,
      share: total > 0 ? facings / total : 0,
    }))
    .sort((a, b) => b.facings - a.facings);
}
