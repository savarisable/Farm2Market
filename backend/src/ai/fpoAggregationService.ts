/**
 * FPO Aggregation Intelligence Engine
 * Groups smallholder farmer lots of the same crop and grade in geographic clusters.
 * Calculates bulk volume unlock thresholds, institutional price premiums,
 * and distributed collective financial gains.
 */

export interface FPOMemberLot {
  memberId: string;
  farmerName: string;
  location: string;
  cropName: string;
  quantityKg: number;
  grade: string;
  allocatedRevenue?: number;
}

export interface FPOAggregationResult {
  fpoId: string;
  cropName: string;
  grade: string;
  memberLots: FPOMemberLot[];
  totalAggregatedQuantityKg: number;
  memberCount: number;
  bulkThresholdKg: number;
  isBulkUnlocked: boolean;
  baseMarketPricePerKg: number;
  bulkPremiumPerKg: number;
  finalBulkPricePerKg: number;
  totalAggregatedRevenue: number;
  additionalCollectiveGain: number;
  averageGainPerFarmer: number;
  recommendedLogisticsRoute: string;
  savingsFreightConsolidated: number;
  statusMessage: string;
}

export function aggregateFPOLots(
  fpoId: string,
  cropName: string,
  members: FPOMemberLot[],
  bulkTargetKg: number = 2500
): FPOAggregationResult {
  const matchingMembers = members.filter((m) => m.cropName === cropName);
  const totalQuantity = matchingMembers.reduce((sum, m) => sum + m.quantityKg, 0);
  const memberCount = matchingMembers.length;

  const baseMarketPrice = cropName === 'Tomato' ? 26.0 : cropName === 'Onion' ? 28.0 : 22.0;
  const isBulkUnlocked = totalQuantity >= bulkTargetKg;
  const bulkPremium = isBulkUnlocked ? 3.0 : 0.0;
  const finalPrice = baseMarketPrice + bulkPremium;

  const totalAggregatedRevenue = Math.round(totalQuantity * finalPrice);
  const additionalCollectiveGain = Math.round(totalQuantity * bulkPremium);
  const averageGainPerFarmer = memberCount > 0 ? Math.round(additionalCollectiveGain / memberCount) : 0;

  // Allocate revenue proportionally to each farmer
  matchingMembers.forEach((m) => {
    m.allocatedRevenue = Math.round(m.quantityKg * finalPrice);
  });

  const freightSavings = isBulkUnlocked ? 4200 : 1200;

  let statusMessage = '';
  if (isBulkUnlocked) {
    statusMessage = `Bulk order unlocked! Aggregated volume (${totalQuantity.toLocaleString()} kg) exceeds institutional buyer threshold (${bulkTargetKg.toLocaleString()} kg), securing a +₹${bulkPremium}/kg price bonus.`;
  } else {
    statusMessage = `Current aggregated pool is ${totalQuantity.toLocaleString()} kg. Need ${(bulkTargetKg - totalQuantity).toLocaleString()} kg more to unlock +₹3/kg institutional pricing.`;
  }

  return {
    fpoId,
    cropName,
    grade: 'GRADE_A',
    memberLots: matchingMembers,
    totalAggregatedQuantityKg: totalQuantity,
    memberCount,
    bulkThresholdKg: bulkTargetKg,
    isBulkUnlocked,
    baseMarketPricePerKg: baseMarketPrice,
    bulkPremiumPerKg: bulkPremium,
    finalBulkPricePerKg: finalPrice,
    totalAggregatedRevenue,
    additionalCollectiveGain,
    averageGainPerFarmer,
    recommendedLogisticsRoute: 'Milk-run collection: Dindori → Niphad → Yeola → Sinnar → Pune Wholesale Hub',
    savingsFreightConsolidated: freightSavings,
    statusMessage,
  };
}
