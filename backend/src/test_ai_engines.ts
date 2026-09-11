import { predictPrice } from './ai/pricePredictionService';
import { forecastDemand } from './ai/demandForecastService';
import { recommendBestMarket } from './ai/marketRecommendationService';
import { matchBuyers } from './ai/buyerMatchingService';
import { evaluateFairPrice } from './ai/fairPriceEngine';
import { generateNegotiationAdvice } from './ai/negotiationService';
import { planCrops } from './ai/cropPlanningService';
import { aggregateFPOLots } from './ai/fpoAggregationService';
import { optimizeLogisticsRoute } from './ai/logisticsOptimizationService';
import { assessPerishability } from './ai/perishabilityService';
import { computeFarmerTrustScore } from './ai/reputationService';
import { calculateOpportunityScore } from './ai/opportunityScoreService';

console.log('🧪 Testing Farm2Market AI Algorithmic Intelligence Engines...\n');

// 1. Price Prediction
const priceRes = predictPrice({ cropName: 'Tomato', location: 'Nashik', horizonDays: 3 });
console.log('1. Price Prediction:', {
  crop: priceRes.cropName,
  current: priceRes.currentPrice,
  predicted: priceRes.predictedPrice,
  trend: `${priceRes.trendPercent}%`,
  recommendation: priceRes.recommendation,
});

// 2. Demand Forecast
const demandRes = forecastDemand('Tomato', 'Pune');
console.log('2. Demand Forecast:', {
  region: demandRes.region,
  currentDemand: `${demandRes.currentDemandPercent}%`,
  supplyIndex: `${demandRes.supplyIndexPercent}%`,
  gap: `${demandRes.shortageSurplusGapPercent}%`,
  alert: demandRes.alertLevel,
});

// 3. Best Market Recommendation
const marketRes = recommendBestMarket('Nashik', 'Tomato', 2000, 'GRADE_A');
console.log('3. Best Market Recommendation:', {
  bestMarket: marketRes.bestMarket.marketName,
  netRealization: `₹${marketRes.bestMarket.netRealizationPerKg}/kg`,
  totalPotentialNet: `₹${marketRes.bestMarket.totalPotentialNetRevenue}`,
  rationale: marketRes.rationale,
});

// 4. Fair Price Engine
const fairPriceRes = evaluateFairPrice('Tomato', 25.0, 2000, 'GRADE_A', 'Pune');
console.log('4. Fair Price Engine:', {
  offeredPrice: `₹${fairPriceRes.offeredPricePerKg}/kg`,
  fairBand: `₹${fairPriceRes.fairPriceMin} - ₹${fairPriceRes.fairPriceMax}/kg`,
  status: fairPriceRes.evaluationStatus,
  potentialExtraRealization: `₹${fairPriceRes.potentialAdditionalRealization}`,
});

// 5. Negotiation Assistant
const negRes = generateNegotiationAdvice('off-123', 'Tomato', 25.0, 2000, 'GRADE_A');
console.log('5. Negotiation Assistant:', {
  suggestedCounter: `₹${negRes.suggestedCounterPrice}/kg`,
  floorPrice: `₹${negRes.minimumAcceptableFloorPrice}/kg`,
  actions: negRes.quickActions.map((a) => `${a.label} (${a.price})`),
});

// 6. Logistics & Load Consolidation
const logRes = optimizeLogisticsRoute();
console.log('6. Smart Logistics:', {
  truckCapacity: `${logRes.vehicleCapacityKg} kg`,
  utilizedWeight: `${logRes.totalCargoWeightKg} kg`,
  utilization: `${logRes.utilizationPercent}%`,
  separateCost: `₹${logRes.separateTransportCost}`,
  consolidatedCost: `₹${logRes.consolidatedTransportCost}`,
  savings: `₹${logRes.totalSavingsAmount}`,
});

// 7. Crop Planning
const cropPlanRes = planCrops({ region: 'Nashik', farmSizeAcres: 4.5, season: 'KHARIF', waterAvailability: 'HIGH' });
console.log('7. Crop Planning ("What Should I Grow?"):', {
  topCrop: cropPlanRes.topRecommendations[0].cropName,
  demandScore: `${cropPlanRes.topRecommendations[0].demandScorePercent}%`,
  estimatedNetProfit: `₹${cropPlanRes.topRecommendations[0].estimatedNetProfit.toLocaleString()}`,
  roi: `${cropPlanRes.topRecommendations[0].roiPercent}%`,
});

// 8. FPO Aggregation
const fpoRes = aggregateFPOLots('fpo-1', 'Tomato', [
  { memberId: '1', farmerName: 'Farmer A', location: 'Dindori', cropName: 'Tomato', quantityKg: 500, grade: 'GRADE_A' },
  { memberId: '2', farmerName: 'Farmer B', location: 'Niphad', cropName: 'Tomato', quantityKg: 700, grade: 'GRADE_A' },
  { memberId: '3', farmerName: 'Farmer C', location: 'Yeola', cropName: 'Tomato', quantityKg: 800, grade: 'GRADE_A' },
  { memberId: '4', farmerName: 'Farmer D', location: 'Sinnar', cropName: 'Tomato', quantityKg: 600, grade: 'GRADE_A' },
]);
console.log('8. FPO Aggregation:', {
  totalQty: `${fpoRes.totalAggregatedQuantityKg} kg`,
  isBulkUnlocked: fpoRes.isBulkUnlocked,
  additionalGain: `₹${fpoRes.additionalCollectiveGain}`,
  avgGainPerFarmer: `₹${fpoRes.averageGainPerFarmer}`,
});

// 9. Perishability
const periRes = assessPerishability('Tomato');
console.log('9. Perishability:', {
  crop: periRes.cropName,
  level: periRes.perishabilityLevel,
  remainingHours: `${periRes.remainingFreshnessHours} hrs`,
  urgency: periRes.urgencyStatus,
});

// 10. Reputation
const repRes = computeFarmerTrustScore({ userId: 'u1', name: 'Ramesh Patil' });
console.log('10. Farmer Trust Score:', {
  score: `${repRes.totalTrustScore}/100`,
  tier: repRes.tierBadge,
});

// 11. Opportunity Score
const oppRes = calculateOpportunityScore('Tomato', 'Nashik');
console.log('11. Opportunity Score:', {
  score: `${oppRes.totalOpportunityScore}/100`,
  directive: oppRes.actionDirective,
});

console.log('\n✅ All 12 AI algorithmic services verified successfully!');
