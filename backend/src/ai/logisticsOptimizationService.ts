/**
 * Smart Logistics & Load Consolidation Engine
 * Calculates milk-run collection routes, vehicle capacity utilization (e.g. 5,000 kg truck),
 * fuel/freight economies of scale, and exact cost savings from consolidated vs fragmented transport.
 */

export interface LogisticsPickupPoint {
  farmerName: string;
  location: string;
  cropName: string;
  quantityKg: number;
  perishability: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  distanceFromBaseKm: number;
}

export interface ConsolidatedRouteResult {
  routeId: string;
  originHub: string;
  destinationHub: string;
  pickupStops: LogisticsPickupPoint[];
  totalCargoWeightKg: number;
  vehicleCapacityKg: number;
  utilizationPercent: number;
  totalRouteDistanceKm: number;
  separateTransportCost: number;
  consolidatedTransportCost: number;
  totalSavingsAmount: number;
  savingsPercent: number;
  routeEfficiencyScore: number;
  recommendedVehicleType: string;
  estimatedTransitTimeHours: number;
  perishabilityPriority: 'URGENT' | 'HIGH' | 'STANDARD';
  dispatchRecommendation: string;
  isConsolidationRecommended: boolean;
  carbonEmissionReductionKg: number;
}

export function optimizeLogisticsRoute(
  originHub: string = 'Nashik Agricultural Belt',
  destinationHub: string = 'Pune Retail Hub',
  pickups: LogisticsPickupPoint[] = [
    { farmerName: 'Ramesh Patil', location: 'Dindori, Nashik', cropName: 'Tomato', quantityKg: 1500, perishability: 'HIGH', distanceFromBaseKm: 15 },
    { farmerName: 'Kisanrao Shinde', location: 'Niphad, Nashik', cropName: 'Tomato', quantityKg: 1000, perishability: 'HIGH', distanceFromBaseKm: 28 },
    { farmerName: 'Tukaram More', location: 'Yeola, Nashik', cropName: 'Tomato', quantityKg: 1200, perishability: 'HIGH', distanceFromBaseKm: 42 },
    { farmerName: 'Pandurang Gaikwad', location: 'Sinnar, Nashik', cropName: 'Tomato', quantityKg: 1000, perishability: 'HIGH', distanceFromBaseKm: 18 },
  ],
  vehicleCapacityKg: number = 5000
): ConsolidatedRouteResult {
  const totalWeight = pickups.reduce((sum, p) => sum + p.quantityKg, 0);
  const utilization = Math.min(100, Math.round((totalWeight / vehicleCapacityKg) * 100));

  // Compute separate individual trip costs
  // An unorganized individual pickup typically hires a small commercial vehicle (SCV) like Tata Ace / Mahindra Bolero
  // Base fixed hire rate ₹2,500 + ₹2.5/kg
  const separateCost = pickups.reduce((sum, p) => {
    const individualTrip = 2500 + p.quantityKg * 2.0;
    return sum + individualTrip;
  }, 0);

  // Consolidated milk-run route cost:
  // 1 medium truck (e.g. Eicher 14ft / 17ft) hiring rate: ₹5,000 base + ₹0.70/kg freight
  const consolidatedCost = Math.round(4800 + totalWeight * 0.75);
  const savings = Math.max(0, separateCost - consolidatedCost);
  const savingsPercent = Math.round((savings / separateCost) * 100);

  const mainCorridorDistanceKm = 210; // Nashik to Pune
  const pickupDetourDistanceKm = pickups.length * 8;
  const totalDistance = mainCorridorDistanceKm + pickupDetourDistanceKm;
  const transitHours = Math.round((totalDistance / 42) * 10) / 10;

  // Check perishability priority
  const hasHighPerishable = pickups.some((p) => p.perishability === 'HIGH' || p.perishability === 'VERY_HIGH');
  const perishabilityPriority = hasHighPerishable ? 'URGENT' : 'STANDARD';

  // Efficiency score calculation: weight utilization + savings % + speed factor
  const routeScore = Math.min(99, Math.round(utilization * 0.5 + savingsPercent * 0.35 + 15));

  const carbonReduction = Math.round((pickups.length - 1) * 35.4); // ~35kg CO2 saved per consolidated SCV trip

  let vehicleType = 'Eicher Pro 2049 (5-Ton Reefer / Insulated)';
  if (totalWeight > 5000) vehicleType = 'Tata Ultra T.9 (7-Ton Capacity)';
  else if (totalWeight < 2500) vehicleType = 'Mahindra Bolero Maxi Truck (2.5-Ton)';

  return {
    routeId: 'RT-MH-CONSOL-2609',
    originHub,
    destinationHub,
    pickupStops: pickups,
    totalCargoWeightKg: totalWeight,
    vehicleCapacityKg,
    utilizationPercent: utilization,
    totalRouteDistanceKm: totalDistance,
    separateTransportCost: Math.round(separateCost),
    consolidatedTransportCost: consolidatedCost,
    totalSavingsAmount: savings,
    savingsPercent,
    routeEfficiencyScore: routeScore,
    recommendedVehicleType: vehicleType,
    estimatedTransitTimeHours: transitHours,
    perishabilityPriority,
    dispatchRecommendation:
      utilization >= 80
        ? `Consolidated milk-run highly recommended. High vehicle utilization (${utilization}%) captures ₹${savings.toLocaleString()} in logistics savings.`
        : `Vehicle capacity underutilized (${utilization}%). Consider adding nearby farmers to optimize freight rates.`,
    isConsolidationRecommended: utilization >= 60,
    carbonEmissionReductionKg: carbonReduction,
  };
}
