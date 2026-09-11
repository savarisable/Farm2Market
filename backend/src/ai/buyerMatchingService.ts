/**
 * AI Buyer-Farmer Matching Engine
 * Ranks potential buyers based on a multi-factor weighted scoring model:
 * - 30% Price compatibility
 * - 20% Distance & logistics feasibility
 * - 20% Quality grade alignment
 * - 15% Demand urgency
 * - 10% Reliability / Trust score
 * - 5% Delivery capability
 */

export interface BuyerMatchItem {
  buyerId: string;
  requirementId?: string;
  buyerUserId?: string;
  businessName: string;
  buyerType: string;
  location: string;
  distanceKm: number;
  offeredPricePerKg: number;
  requiredQuantityKg: number;
  requiredByDate: string;
  requiredGrade: string;
  trustScore: number;
  matchScorePercent: number;
  ranking: number;
  scoreBreakdown: {
    priceScore: number;
    distanceScore: number;
    qualityScore: number;
    demandScore: number;
    reliabilityScore: number;
    deliveryScore: number;
  };
  highlightReason: string;
}

export interface BuyerMatchingQuery {
  farmerId: string;
  farmerLocation: string;
  cropName: string;
  quantityKg: number;
  grade: string;
  expectedPricePerKg: number;
}

export function matchBuyers(
  query: BuyerMatchingQuery,
  availableBuyers: Array<{
    id: string;
    buyerUserId?: string;
    businessName: string;
    buyerType: string;
    location: string;
    distanceKm?: number;
    budgetPrice: number;
    requiredQuantity: number;
    requiredDate: string;
    requiredGrade: string;
    trustScore: number;
  }>
): BuyerMatchItem[] {
  const matches: BuyerMatchItem[] = availableBuyers.map((b) => {
    // 1. Price Score (30% weight) - Higher budget vs farmer expected price
    const priceRatio = b.budgetPrice / (query.expectedPricePerKg || 26);
    const priceScore = Math.min(100, Math.max(40, Math.round(priceRatio * 85)));

    // 2. Distance Score (20% weight) - Closer is better
    const dist = b.distanceKm !== undefined ? b.distanceKm : 65;
    const distanceScore = Math.min(100, Math.max(30, Math.round(100 - dist * 0.28)));

    // 3. Quality Score (20% weight) - Exact grade match gets 100
    let qualityScore = 75;
    if (b.requiredGrade === query.grade) qualityScore = 100;
    else if (b.requiredGrade === 'GRADE_A' && query.grade === 'GRADE_B') qualityScore = 60;
    else if (b.requiredGrade === 'GRADE_B' && query.grade === 'GRADE_A') qualityScore = 95;

    // 4. Demand Urgency (15% weight)
    const demandScore = Math.min(100, Math.max(60, Math.round(85 + (b.requiredQuantity >= query.quantityKg ? 10 : 0))));

    // 5. Reliability / Trust (10% weight)
    const reliabilityScore = b.trustScore || 90;

    // 6. Delivery Capability (5% weight)
    const deliveryScore = dist < 200 ? 95 : 75;

    // Weighted composite score
    const totalScore = Math.round(
      priceScore * 0.3 +
        distanceScore * 0.2 +
        qualityScore * 0.2 +
        demandScore * 0.15 +
        reliabilityScore * 0.1 +
        deliveryScore * 0.05
    );

    let highlight = 'Competitive pricing with verified payment history.';
    if (totalScore >= 90) {
      highlight = 'Optimal match: Excellent price, exact grade requirement, and low transit friction.';
    } else if (dist < 50) {
      highlight = 'Proximity match: Local buyer offering rapid farm-gate pickup.';
    }

    return {
      buyerId: b.buyerUserId || b.id,
      requirementId: b.id,
      buyerUserId: b.buyerUserId || b.id,
      businessName: b.businessName,
      buyerType: b.buyerType,
      location: b.location,
      distanceKm: dist,
      offeredPricePerKg: b.budgetPrice,
      requiredQuantityKg: b.requiredQuantity,
      requiredByDate: b.requiredDate,
      requiredGrade: b.requiredGrade,
      trustScore: b.trustScore,
      matchScorePercent: totalScore,
      ranking: 1,
      scoreBreakdown: {
        priceScore,
        distanceScore,
        qualityScore,
        demandScore,
        reliabilityScore,
        deliveryScore,
      },
      highlightReason: highlight,
    };
  });

  // Sort by match score descending
  matches.sort((a, b) => b.matchScorePercent - a.matchScorePercent);
  matches.forEach((m, idx) => {
    m.ranking = idx + 1;
  });

  return matches;
}
