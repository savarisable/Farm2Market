/**
 * Demand Forecasting Intelligence Service
 * Predicts regional consumption demand, incoming mandi supply arrivals,
 * and pinpoints supply-demand deficits / arbitrage opportunities.
 */

export interface DemandForecastResult {
  cropName: string;
  region: string;
  currentDemandPercent: number;
  predicted7dDemand: number;
  predicted30dDemand: number;
  supplyIndexPercent: number;
  shortageSurplusGapPercent: number;
  gapStatus: 'ACUTE_SHORTAGE' | 'MODERATE_SHORTAGE' | 'BALANCED' | 'SURPLUS';
  alertLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SURPLUS';
  recommendation: string;
  crossDistrictOpportunity?: string;
  timeline: {
    period: string;
    demand: number;
    supply: number;
    projectedPrice: number;
  }[];
  isPrototypeAI: boolean;
}

const REGIONAL_DEMAND_PROFILES: Record<
  string,
  Record<string, { current: number; d7: number; d30: number; supply: number; basePrice: number }>
> = {
  Pune: {
    Tomato: { current: 89, d7: 94, d30: 72, supply: 61, basePrice: 30 },
    Onion: { current: 84, d7: 88, d30: 75, supply: 68, basePrice: 31.5 },
    Potato: { current: 65, d7: 68, d30: 62, supply: 70, basePrice: 24 },
    Wheat: { current: 70, d7: 72, d30: 70, supply: 75, basePrice: 25 },
    Cabbage: { current: 58, d7: 62, d30: 55, supply: 65, basePrice: 17 },
  },
  Mumbai: {
    Tomato: { current: 92, d7: 96, d30: 78, supply: 58, basePrice: 34 },
    Onion: { current: 88, d7: 91, d30: 80, supply: 62, basePrice: 35 },
    Potato: { current: 75, d7: 78, d30: 72, supply: 66, basePrice: 27 },
    Wheat: { current: 78, d7: 80, d30: 76, supply: 72, basePrice: 27 },
    Cabbage: { current: 68, d7: 70, d30: 64, supply: 62, basePrice: 19 },
  },
  Nashik: {
    Tomato: { current: 63, d7: 68, d30: 60, supply: 91, basePrice: 25 },
    Onion: { current: 66, d7: 70, d30: 64, supply: 88, basePrice: 28 },
    Potato: { current: 55, d7: 58, d30: 54, supply: 75, basePrice: 21 },
    Wheat: { current: 62, d7: 64, d30: 60, supply: 80, basePrice: 24 },
    Cabbage: { current: 52, d7: 55, d30: 50, supply: 78, basePrice: 15 },
  },
  Surat: {
    Tomato: { current: 82, d7: 86, d30: 70, supply: 65, basePrice: 33 },
    Onion: { current: 78, d7: 82, d30: 72, supply: 67, basePrice: 33.5 },
    Potato: { current: 70, d7: 73, d30: 68, supply: 70, basePrice: 26 },
    Wheat: { current: 74, d7: 76, d30: 72, supply: 71, basePrice: 26.5 },
    Cabbage: { current: 60, d7: 64, d30: 58, supply: 64, basePrice: 18 },
  },
  Nagpur: {
    Tomato: { current: 68, d7: 70, d30: 65, supply: 72, basePrice: 28 },
    Onion: { current: 72, d7: 75, d30: 70, supply: 74, basePrice: 30 },
    Potato: { current: 64, d7: 66, d30: 62, supply: 68, basePrice: 23 },
    Wheat: { current: 76, d7: 78, d30: 74, supply: 72, basePrice: 25 },
    Soybean: { current: 85, d7: 89, d30: 82, supply: 62, basePrice: 46 },
    Cotton: { current: 88, d7: 92, d30: 84, supply: 59, basePrice: 64 },
  },
};

export function forecastDemand(cropName: string, region: string): DemandForecastResult {
  const regProfile = REGIONAL_DEMAND_PROFILES[region] || REGIONAL_DEMAND_PROFILES['Pune'];
  const cropData = regProfile[cropName] || {
    current: 75,
    d7: 80,
    d30: 68,
    supply: 65,
    basePrice: 26,
  };

  const gap = cropData.current - cropData.supply;

  let gapStatus: 'ACUTE_SHORTAGE' | 'MODERATE_SHORTAGE' | 'BALANCED' | 'SURPLUS' = 'BALANCED';
  let alertLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'SURPLUS' = 'LOW';
  let recommendation = '';

  if (gap >= 25) {
    gapStatus = 'ACUTE_SHORTAGE';
    alertLevel = 'HIGH';
    recommendation = `Acute ${cropName} deficit detected in ${region} (+${gap}% gap). High consumer demand over the next 7 days will drive premium spot prices. Priority market dispatch recommended.`;
  } else if (gap >= 10) {
    gapStatus = 'MODERATE_SHORTAGE';
    alertLevel = 'MEDIUM';
    recommendation = `Sustained demand outpaces mandi arrivals in ${region} (+${gap}% gap). Prices will remain firm over the next 7–14 days.`;
  } else if (gap <= -15) {
    gapStatus = 'SURPLUS';
    alertLevel = 'SURPLUS';
    recommendation = `Local production glut in ${region} (Supply exceeds demand by ${Math.abs(gap)}%). Local mandi prices will face downward pressure. Consider routing produce to deficit hubs.`;
  } else {
    gapStatus = 'BALANCED';
    alertLevel = 'LOW';
    recommendation = `Supply and demand in ${region} are currently balanced. Routine trading patterns expected.`;
  }

  // Cross district opportunity recommendation
  let crossDistrictOpportunity: string | undefined;
  if (region === 'Nashik' && gap < 0) {
    crossDistrictOpportunity = 'Nashik → Pune / Mumbai arbitrage opportunity detected. Transport costs are heavily outweighed by consumption hub premiums.';
  } else if (region === 'Pune' && gap > 0) {
    crossDistrictOpportunity = 'High influx required from Nashik agricultural belt to stabilize Pune retail prices.';
  }

  const timeline = [
    { period: 'Current', demand: cropData.current, supply: cropData.supply, projectedPrice: cropData.basePrice },
    {
      period: 'Next 3 Days',
      demand: Math.round((cropData.current + cropData.d7) / 2),
      supply: Math.round((cropData.supply + (gapStatus === 'ACUTE_SHORTAGE' ? 62 : 68)) / 2),
      projectedPrice: Math.round((cropData.basePrice * 1.04) * 10) / 10,
    },
    {
      period: 'Next 7 Days',
      demand: cropData.d7,
      supply: Math.round(cropData.supply * (gapStatus === 'ACUTE_SHORTAGE' ? 1.05 : 0.98)),
      projectedPrice: Math.round((cropData.basePrice * 1.09) * 10) / 10,
    },
    {
      period: 'Next 14 Days',
      demand: Math.round((cropData.d7 + cropData.d30) / 2),
      supply: Math.round(cropData.supply * 1.08),
      projectedPrice: Math.round((cropData.basePrice * 1.03) * 10) / 10,
    },
    {
      period: 'Next 30 Days',
      demand: cropData.d30,
      supply: Math.round(cropData.supply * 1.12),
      projectedPrice: Math.round((cropData.basePrice * 0.98) * 10) / 10,
    },
  ];

  return {
    cropName,
    region,
    currentDemandPercent: cropData.current,
    predicted7dDemand: cropData.d7,
    predicted30dDemand: cropData.d30,
    supplyIndexPercent: cropData.supply,
    shortageSurplusGapPercent: gap,
    gapStatus,
    alertLevel,
    recommendation,
    crossDistrictOpportunity,
    timeline,
    isPrototypeAI: true,
  };
}
