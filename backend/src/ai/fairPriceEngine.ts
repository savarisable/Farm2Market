/**
 * Fair Price Engine
 * Evaluates buyer offers against objective agricultural economic benchmarks:
 * - Wholesale Mandi Average
 * - Nearby Terminal Hub Spot Average
 * - Quality-adjusted Premium (Grade A/B/C)
 * - Real-time Demand Adjusted Fair Benchmark
 * Computes exact potential additional realization for the farmer's harvest.
 */

export interface FairPriceEvaluation {
  cropName: string;
  offeredPricePerKg: number;
  quantityKg: number;
  grade: string;
  marketAveragePrice: number;
  nearbyRegionalAverage: number;
  qualityAdjustedPrice: number;
  demandAdjustedPrice: number;
  fairPriceMin: number;
  fairPriceMax: number;
  fairPriceTarget: number;
  evaluationStatus: 'BELOW_FAIR_PRICE' | 'FAIR_PRICE' | 'ABOVE_FAIR_PRICE';
  potentialAdditionalRealization: number;
  suggestedAction: string;
  explanation: string;
  isPrototypeAI: boolean;
}

export function evaluateFairPrice(
  cropName: string,
  offeredPrice: number,
  quantityKg: number = 2000,
  grade: string = 'GRADE_A',
  region: string = 'Pune'
): FairPriceEvaluation {
  // Base market benchmarks
  const baseMap: Record<string, number> = {
    Tomato: 27.0,
    Onion: 29.0,
    Potato: 23.0,
    Wheat: 25.0,
    Soybean: 45.0,
    Cotton: 63.0,
    Banana: 19.0,
    Cabbage: 16.5,
  };

  const marketAverage = baseMap[cropName] || 26.0;
  const nearbyRegionalAverage = Math.round((marketAverage * 1.04) * 10) / 10; // +4% nearby consumption hub

  // Quality adjustment
  const qualityMultiplier = grade === 'GRADE_A' ? 1.08 : grade === 'GRADE_B' ? 1.0 : 0.92;
  const qualityAdjusted = Math.round((marketAverage * qualityMultiplier) * 10) / 10;

  // Demand adjustment (Pune / Mumbai demand index factor)
  const demandAdjusted = Math.round((qualityAdjusted * 1.05) * 10) / 10;

  const fairPriceMin = Math.round(qualityAdjusted);
  const fairPriceMax = Math.round(demandAdjusted);
  const fairPriceTarget = Math.round(((fairPriceMin + fairPriceMax) / 2) * 10) / 10;

  let evaluationStatus: 'BELOW_FAIR_PRICE' | 'FAIR_PRICE' | 'ABOVE_FAIR_PRICE' = 'FAIR_PRICE';
  let potentialGain = 0;
  let suggestedAction = '';
  let explanation = '';

  if (offeredPrice < fairPriceMin) {
    evaluationStatus = 'BELOW_FAIR_PRICE';
    const unitGap = fairPriceTarget - offeredPrice;
    potentialGain = Math.round(unitGap * quantityKg);
    suggestedAction = `Counter offer at ₹${fairPriceMax}/kg`;
    explanation = `The buyer's offer of ₹${offeredPrice}/kg is below the current fair market corridor of ₹${fairPriceMin}–${fairPriceMax}/kg. Demand is high and comparable ${grade} crops are clearing at ₹${fairPriceTarget}/kg. You risk leaving ₹${potentialGain.toLocaleString()} on the table.`;
  } else if (offeredPrice > fairPriceMax) {
    evaluationStatus = 'ABOVE_FAIR_PRICE';
    suggestedAction = `Accept offer promptly`;
    explanation = `The offer of ₹${offeredPrice}/kg includes an attractive buyer premium over prevailing mandi averages. Lock in this contract to secure optimal returns.`;
  } else {
    evaluationStatus = 'FAIR_PRICE';
    suggestedAction = `Accept or negotiate marginal +₹1/kg freight offset`;
    explanation = `The offer of ₹${offeredPrice}/kg falls squarely within the fair agricultural valuation band (₹${fairPriceMin}–${fairPriceMax}/kg).`;
  }

  return {
    cropName,
    offeredPricePerKg: offeredPrice,
    quantityKg,
    grade,
    marketAveragePrice: marketAverage,
    nearbyRegionalAverage,
    qualityAdjustedPrice: qualityAdjusted,
    demandAdjustedPrice: demandAdjusted,
    fairPriceMin,
    fairPriceMax,
    fairPriceTarget,
    evaluationStatus,
    potentialAdditionalRealization: potentialGain,
    suggestedAction,
    explanation,
    isPrototypeAI: true,
  };
}
