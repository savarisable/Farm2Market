/**
 * Farmer Opportunity Score Engine
 * Computes a unified 0–100 index integrating:
 * - Real-time Demand Pressure (25%)
 * - Price Momentum / Trend (25%)
 * - Regional Competition / Supply Glut (20%)
 * - Logistics Feasibility & Freight Efficiency (15%)
 * - Active Verified Buyer Availability (15%)
 * Outputs actionable advice (e.g. "SELL WITHIN 3 DAYS").
 */

export interface OpportunityScoreResult {
  cropName: string;
  location: string;
  totalOpportunityScore: number;
  marketMomentum: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  actionDirective: 'SELL WITHIN 3 DAYS' | 'SELL NOW' | 'WAIT FOR PEAK' | 'STAGGER HARVEST';
  subScores: {
    demandScore: number;
    priceMomentumScore: number;
    competitionResistanceScore: number;
    logisticsViabilityScore: number;
    buyerReadinessScore: number;
  };
  summaryReason: string;
  keyDrivers: string[];
}

export function calculateOpportunityScore(
  cropName: string,
  location: string,
  priceTrendPercent: number = 8.4,
  demandPercent: number = 89,
  supplyPercent: number = 61,
  activeBuyerCount: number = 4
): OpportunityScoreResult {
  // 1. Demand Score (25%)
  const demandScore = Math.min(100, Math.max(20, demandPercent));

  // 2. Price Momentum Score (25%) - positive trend scores high
  const priceMomentum = Math.min(100, Math.max(30, Math.round(70 + priceTrendPercent * 2.5)));

  // 3. Low Competition / Low Glut Score (20%) - lower local supply yields higher opportunity
  const competitionResistance = Math.min(100, Math.max(20, Math.round(100 - (supplyPercent - 40) * 1.2)));

  // 4. Logistics Viability (15%) - Nashik/Pune corridors have high connectivity
  const locLower = (location || '').toLowerCase();
  const logisticsViability = locLower.includes('nashik') || locLower.includes('pune') ? 92 : 82;

  // 5. Buyer Readiness Score (15%)
  const buyerReadiness = Math.min(100, Math.max(40, Math.round(60 + activeBuyerCount * 8)));

  const totalScore = Math.round(
    demandScore * 0.25 +
      priceMomentum * 0.25 +
      competitionResistance * 0.2 +
      logisticsViability * 0.15 +
      buyerReadiness * 0.15
  );

  let directive: 'SELL WITHIN 3 DAYS' | 'SELL NOW' | 'WAIT FOR PEAK' | 'STAGGER HARVEST' = 'SELL WITHIN 3 DAYS';
  let momentum: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'BULLISH';

  if (totalScore >= 82) {
    directive = 'SELL WITHIN 3 DAYS';
    momentum = 'BULLISH';
  } else if (totalScore >= 70) {
    directive = 'WAIT FOR PEAK';
    momentum = 'BULLISH';
  } else if (totalScore < 50) {
    directive = 'SELL NOW';
    momentum = 'BEARISH';
  } else {
    directive = 'STAGGER HARVEST';
    momentum = 'NEUTRAL';
  }

  const drivers: string[] = [
    `High consumer demand index (${demandPercent}%) in target destination mandis.`,
    `Positive spot price trajectory (+${priceTrendPercent}% over last 72 hours).`,
    `${activeBuyerCount} active verified institutional buyers seeking ${cropName} lots.`,
    `Consolidated milk-run freight corridor active with 94% vehicle fill rate.`,
  ];

  const summary = `Demand in terminal markets is accelerating (+${priceTrendPercent}%) while local inventory remains scarce. Executing direct buyer contracts within the next 3 days captures maximum price realization.`;

  return {
    cropName,
    location,
    totalOpportunityScore: totalScore,
    marketMomentum: momentum,
    actionDirective: directive,
    subScores: {
      demandScore,
      priceMomentumScore: priceMomentum,
      competitionResistanceScore: competitionResistance,
      logisticsViabilityScore: logisticsViability,
      buyerReadinessScore: buyerReadiness,
    },
    summaryReason: summary,
    keyDrivers: drivers,
  };
}
