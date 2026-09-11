/**
 * Perishability Intelligence Service
 * Monitors post-harvest degradation curves, temperature-humidity sensitivity,
 * dynamic shelf-life countdowns, and optimal logistics dispatch windows.
 */

export interface PerishabilityRiskAssessment {
  cropName: string;
  perishabilityLevel: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  harvestDate: string;
  totalShelfLifeHours: number;
  hoursElapsedSinceHarvest: number;
  remainingFreshnessHours: number;
  freshnessIndexPercent: number;
  decayRatePerHour: number;
  recommendedStorageConditions: {
    optimalTempC: string;
    optimalHumidityPercent: string;
    ventilationReq: string;
  };
  urgencyStatus: 'CRITICAL' | 'EXPEDITE' | 'NORMAL' | 'SAFE';
  actionRecommendation: string;
  requiresReeferVehicle: boolean;
}

const PERISHABILITY_SPECS: Record<
  string,
  {
    level: 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
    shelfLifeHours: number;
    decayRate: number;
    temp: string;
    humidity: string;
    vent: string;
  }
> = {
  Tomato: {
    level: 'HIGH',
    shelfLifeHours: 72,
    decayRate: 1.38,
    temp: '13°C to 15°C',
    humidity: '85% - 90%',
    vent: 'Well-ventilated ambient / cool van',
  },
  Banana: {
    level: 'VERY_HIGH',
    shelfLifeHours: 48,
    decayRate: 2.08,
    temp: '13°C to 14°C',
    humidity: '90% - 95%',
    vent: 'Strict ethylene control',
  },
  Potato: {
    level: 'LOW',
    shelfLifeHours: 720,
    decayRate: 0.13,
    temp: '10°C to 12°C',
    humidity: '85%',
    vent: 'Dark, dry, ventilated storage',
  },
  Onion: {
    level: 'LOW',
    shelfLifeHours: 600,
    decayRate: 0.16,
    temp: 'Ambient dry / 0°C to 2°C',
    humidity: '65% - 70%',
    vent: 'High air circulation required',
  },
  Cabbage: {
    level: 'MEDIUM',
    shelfLifeHours: 120,
    decayRate: 0.83,
    temp: '0°C to 2°C',
    humidity: '95% - 100%',
    vent: 'Moisture retention crates',
  },
};

export function assessPerishability(
  cropName: string,
  harvestDateStr: string = new Date().toISOString()
): PerishabilityRiskAssessment {
  const spec = PERISHABILITY_SPECS[cropName] || {
    level: 'MEDIUM',
    shelfLifeHours: 96,
    decayRate: 1.04,
    temp: '10°C to 15°C',
    humidity: '80%',
    vent: 'Standard covered transit',
  };

  const harvestTime = new Date(harvestDateStr).getTime();
  const currentTime = Date.now();
  const hoursElapsed = Math.max(0, Math.round((currentTime - harvestTime) / (1000 * 60 * 60)));
  const remainingHours = Math.max(0, spec.shelfLifeHours - hoursElapsed);
  const freshnessPercent = Math.min(100, Math.max(0, Math.round((remainingHours / spec.shelfLifeHours) * 100)));

  let urgency: 'CRITICAL' | 'EXPEDITE' | 'NORMAL' | 'SAFE' = 'NORMAL';
  let action = '';

  if (remainingHours <= 18) {
    urgency = 'CRITICAL';
    action = 'Critical shelf-life window. Liquidate to local buyers immediately or route via expedited cold-chain.';
  } else if (remainingHours <= 36 || spec.level === 'HIGH' || spec.level === 'VERY_HIGH') {
    urgency = 'EXPEDITE';
    action = 'Prioritize delivery. Dispatch produce within the next 24 hours to prevent firmness degradation.';
  } else if (remainingHours <= 96) {
    urgency = 'NORMAL';
    action = 'Standard dispatch window. Ensure produce is packed in ventilated crates away from direct sunlight.';
  } else {
    urgency = 'SAFE';
    action = 'Long-shelf-life commodity. Farmer has strategic flexibility to wait for peak spot prices.';
  }

  return {
    cropName,
    perishabilityLevel: spec.level,
    harvestDate: harvestDateStr,
    totalShelfLifeHours: spec.shelfLifeHours,
    hoursElapsedSinceHarvest: hoursElapsed,
    remainingFreshnessHours: remainingHours,
    freshnessIndexPercent: freshnessPercent,
    decayRatePerHour: spec.decayRate,
    recommendedStorageConditions: {
      optimalTempC: spec.temp,
      optimalHumidityPercent: spec.humidity,
      ventilationReq: spec.vent,
    },
    urgencyStatus: urgency,
    actionRecommendation: action,
    requiresReeferVehicle: spec.level === 'VERY_HIGH' || (spec.level === 'HIGH' && hoursElapsed > 36),
  };
}
