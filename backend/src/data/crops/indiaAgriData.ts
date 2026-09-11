/**
 * India Agricultural Knowledge Base & Regional Soil-Climate Profiles
 * Sources:
 * - Indian Council of Agricultural Research (ICAR) Agro-Ecological Zones
 * - National Bureau of Soil Survey and Land Use Planning (NBSS&LUP)
 * - India Meteorological Department (IMD) District Agro-meteorological Bulletins
 * - Ministry of Agriculture & Farmers Welfare (Agmarknet & CACP Reports)
 */

export interface LocationHierarchyState {
  stateName: string;
  stateCode: string;
  districts: {
    districtName: string;
    talukas: string[];
    dominantSoil: string;
    annualRainfallMm: number;
    avgTempRange: { min: number; max: number };
    irrigationCoveragePercent: number;
    historicalYields: Record<string, number>; // kg/acre historical district yields
  }[];
}

export interface SoilTypeProfile {
  type: string;
  localName: string;
  phRange: [number, number];
  waterRetention: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  drainage: 'EXCESSIVE' | 'GOOD' | 'MODERATE' | 'POOR';
  organicCarbonPercent: number;
  suitableCrops: string[];
  unsuitableCrops: string[];
  keyStrengths: string;
  managementTip: string;
}

export interface CropAgronomy {
  cropName: string;
  category: 'CASH_FIBER' | 'OILSEED' | 'GRAIN' | 'VEGETABLE' | 'PULSE' | 'SPECIALTY';
  hindiName: string;
  marathiName: string;
  preferredSoils: string[];
  optimalPhRange: [number, number];
  tempRangeOptimalC: [number, number];
  waterRequirementMm: [number, number];
  irrigationSensitivity: 'LOW' | 'MODERATE' | 'HIGH';
  growingDurationDays: [number, number];
  avgCultivationCostPerAcre: number; // INR
  expectedYieldQuintalsPerAcre: [number, number]; // [min, max]
  expectedPricePerQuintal: [number, number]; // INR [min, max]
  mspPerQuintal?: number; // Minimum Support Price if applicable
  marketDemandRating: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  riskProfile: {
    pestRisk: 'LOW' | 'MODERATE' | 'HIGH';
    climateRisk: 'LOW' | 'MODERATE' | 'HIGH';
    priceVolatility: 'LOW' | 'MODERATE' | 'HIGH';
  };
  whyFactors: {
    soilFactor: string;
    climateFactor: string;
    waterFactor: string;
    economicFactor: string;
  };
  recommendedSowingWindow: string;
  icarAdvisory: string;
}

// 1. Soil Types Profile
export const INDIA_SOIL_PROFILES: Record<string, SoilTypeProfile> = {
  'Black Cotton Soil': {
    type: 'Black Cotton Soil',
    localName: 'Regur / काळी माती',
    phRange: [7.2, 8.5],
    waterRetention: 'VERY_HIGH',
    drainage: 'MODERATE',
    organicCarbonPercent: 0.65,
    suitableCrops: ['Cotton', 'Soybean', 'Wheat', 'Chickpea (Gram)', 'Sugarcane', 'Onion'],
    unsuitableCrops: ['Potato', 'Groundnut', 'Mushroom'],
    keyStrengths: 'High montmorillonite clay content provides exceptional water retention and nutrient cation-exchange.',
    managementTip: 'Avoid deep tilling when excessively wet to prevent soil compaction and waterlogging.',
  },
  'Red Loamy Soil': {
    type: 'Red Loamy Soil',
    localName: 'तांबडी माती / लाल दोमट',
    phRange: [6.0, 7.2],
    waterRetention: 'MEDIUM',
    drainage: 'GOOD',
    organicCarbonPercent: 0.55,
    suitableCrops: ['Groundnut', 'Maize', 'Soybean', 'Tomato', 'Chickpea (Gram)', 'Cotton'],
    unsuitableCrops: ['Wheat'],
    keyStrengths: 'Excellent aeration and root penetration; warms up rapidly in early Kharif season.',
    managementTip: 'Incorporate organic compost (FYM) or green manuring to boost moisture holding capacity.',
  },
  'Clay Loam': {
    type: 'Clay Loam',
    localName: 'चिकणमाती मिश्रित दोमट',
    phRange: [6.5, 7.8],
    waterRetention: 'HIGH',
    drainage: 'MODERATE',
    organicCarbonPercent: 0.72,
    suitableCrops: ['Wheat', 'Tomato', 'Onion', 'Soybean', 'Cotton', 'Maize'],
    unsuitableCrops: ['Groundnut'],
    keyStrengths: 'Balanced balance of clay moisture conservation and silt fertility.',
    managementTip: 'Maintain drip irrigation or raised bed furrow method to prevent root rot during peak rains.',
  },
  'Sandy Loam': {
    type: 'Sandy Loam',
    localName: 'रेती मिश्रित पोयटा / बलुई दोमट',
    phRange: [6.2, 7.4],
    waterRetention: 'LOW',
    drainage: 'GOOD',
    organicCarbonPercent: 0.42,
    suitableCrops: ['Groundnut', 'Maize', 'Vegetables', 'Tomato', 'Onion'],
    unsuitableCrops: ['Wheat', 'Cotton'],
    keyStrengths: 'Porous structure ideal for tuber development and pod formation without resistance.',
    managementTip: 'Requires frequent light irrigation cycles and split nitrogen application to prevent leaching.',
  },
  'Alluvial Soil': {
    type: 'Alluvial Soil',
    localName: 'गाळाची जमीन / जलोढ़ मिट्टी',
    phRange: [6.8, 8.0],
    waterRetention: 'HIGH',
    drainage: 'GOOD',
    organicCarbonPercent: 0.80,
    suitableCrops: ['Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Tomato'],
    unsuitableCrops: [],
    keyStrengths: 'Deep, fertile river basin deposits rich in potash and phosphoric acid.',
    managementTip: 'Test micronutrients (Zinc, Boron) periodically for intensive multi-cropping.',
  },
  'Laterite / Controlled Substrate': {
    type: 'Laterite / Controlled Substrate',
    localName: 'जांभी जमीन / नियंत्रित वातावरण',
    phRange: [5.5, 6.8],
    waterRetention: 'MEDIUM',
    drainage: 'GOOD',
    organicCarbonPercent: 0.90,
    suitableCrops: ['Mushroom', 'Tomato', 'Groundnut'],
    unsuitableCrops: ['Wheat', 'Cotton'],
    keyStrengths: 'Specialized substrates or acidic soils conducive to fungal spawn incubation and protected cultivation.',
    managementTip: 'Ideal for indoor shed mushroom cultivation (Oyster/Button) using sterilized wheat straw compost.',
  },
};

// 2. Comprehensive Crop Agronomy Database
export const CROP_AGRONOMY_DATABASE: Record<string, CropAgronomy> = {
  Cotton: {
    cropName: 'Cotton',
    category: 'CASH_FIBER',
    hindiName: 'कपास',
    marathiName: 'कापूस',
    preferredSoils: ['Black Cotton Soil', 'Clay Loam', 'Alluvial Soil'],
    optimalPhRange: [6.5, 8.5],
    tempRangeOptimalC: [21, 35],
    waterRequirementMm: [600, 1100],
    irrigationSensitivity: 'MODERATE',
    growingDurationDays: [150, 180],
    avgCultivationCostPerAcre: 18500,
    expectedYieldQuintalsPerAcre: [7.0, 11.5],
    expectedPricePerQuintal: [6800, 7800],
    mspPerQuintal: 7122, // Medium staple 2024-25 MSP
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'HIGH', // Pink bollworm risk
      climateRisk: 'MODERATE',
      priceVolatility: 'MODERATE',
    },
    whyFactors: {
      soilFactor: 'Deep black cotton soils retain residual moisture essential for boll development during dry post-monsoon spells.',
      climateFactor: 'High sunshine and warm temperatures (24-34°C) favor vegetative branching and square formation.',
      waterFactor: 'Moderate water requirement; thrives with 2-3 supplementary protective irrigations at boll formation.',
      economicFactor: 'High commercial liquidity backed by CCI MSP procurement and strong regional ginning mill demand.',
    },
    recommendedSowingWindow: 'June 15 – July 10 (with arrival of southwest monsoon)',
    icarAdvisory: 'CICR Nagpur: Utilize integrated pest management (IPM) pheromone traps; avoid late-stage nitrogen overdose.',
  },
  Soybean: {
    cropName: 'Soybean',
    category: 'OILSEED',
    hindiName: 'सोयाबीन',
    marathiName: 'सोयाबीन',
    preferredSoils: ['Black Cotton Soil', 'Clay Loam', 'Red Loamy Soil'],
    optimalPhRange: [6.0, 7.5],
    tempRangeOptimalC: [20, 32],
    waterRequirementMm: [450, 750],
    irrigationSensitivity: 'LOW',
    growingDurationDays: [90, 110],
    avgCultivationCostPerAcre: 12500,
    expectedYieldQuintalsPerAcre: [8.0, 12.0],
    expectedPricePerQuintal: [4500, 5200],
    mspPerQuintal: 4892, // 2024-25 MSP
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'MODERATE', // Stem fly, girdle beetle
      climateRisk: 'MODERATE', // Sensitive to dry spells during pod filling
      priceVolatility: 'LOW',
    },
    whyFactors: {
      soilFactor: 'Symbiotic Rhizobium root nodules fix 40-50 kg atmospheric nitrogen per hectare, improving soil health for subsequent Rabi crop.',
      climateFactor: 'Short Kharif duration (95-105 days) perfectly matches typical Vidarbha/Marathwada monsoon rainfall distribution.',
      waterFactor: 'Tolerates temporary moisture stress; only requires assured moisture during flowering and pod development.',
      economicFactor: 'Guaranteed solvent extraction and de-oiled cake (DOC) export demand with fast 100-day cash turnover.',
    },
    recommendedSowingWindow: 'June 20 – July 15 (after 75-100 mm cumulative rainfall)',
    icarAdvisory: 'IISR Indore: Inoculate seed with Bradyrhizobium and PSB culture; maintain broad bed furrow (BBF) to prevent waterlogging.',
  },
  Wheat: {
    cropName: 'Wheat',
    category: 'GRAIN',
    hindiName: 'गेहूं',
    marathiName: 'गहू',
    preferredSoils: ['Clay Loam', 'Alluvial Soil', 'Black Cotton Soil'],
    optimalPhRange: [6.0, 7.8],
    tempRangeOptimalC: [12, 26],
    waterRequirementMm: [400, 600],
    irrigationSensitivity: 'HIGH',
    growingDurationDays: [110, 130],
    avgCultivationCostPerAcre: 14000,
    expectedYieldQuintalsPerAcre: [14.0, 22.0],
    expectedPricePerQuintal: [2400, 2900],
    mspPerQuintal: 2425, // 2024-25 Rabi MSP
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'LOW',
      climateRisk: 'MODERATE', // Terminal heat stress in late February
      priceVolatility: 'LOW',
    },
    whyFactors: {
      soilFactor: 'Heavy loam and deep vertisols provide consistent moisture retention essential for Crown Root Initiation (CRI) and tillering.',
      climateFactor: 'Cool, crisp winter nights (10-15°C) encourage heavy earhead formation and grain filling.',
      waterFactor: 'Requires 4-5 timed irrigations (CRI, tillering, late jointing, flowering, milk stage).',
      economicFactor: 'Staple food grain with stable national floor price, zero perishability risk, and high local grain mandi turnover.',
    },
    recommendedSowingWindow: 'November 1 – November 25 (timely sowing avoids terminal heat stress)',
    icarAdvisory: 'IIWBR Karnal: Sow heat-tolerant varieties (HI-1544, GW-322, HD-2967); ensure first irrigation strictly at 21 days (CRI stage).',
  },
  Mushroom: {
    cropName: 'Mushroom',
    category: 'SPECIALTY',
    hindiName: 'मशरूम (कुकुरमुत्ता)',
    marathiName: 'अळंबी (मशरूम)',
    preferredSoils: ['Laterite / Controlled Substrate', 'Sandy Loam'],
    optimalPhRange: [6.5, 7.5],
    tempRangeOptimalC: [18, 25],
    waterRequirementMm: [150, 300], // Controlled humidity misting
    irrigationSensitivity: 'LOW',
    growingDurationDays: [35, 50], // Fast indoor cropping cycle
    avgCultivationCostPerAcre: 32000, // Shed & substrate setup
    expectedYieldQuintalsPerAcre: [25.0, 45.0], // High output in small square footage
    expectedPricePerQuintal: [14000, 22000], // ₹140 - ₹220 / kg wholesale
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'MODERATE', // Fungal contamination
      climateRisk: 'LOW', // Indoor protected environment
      priceVolatility: 'MODERATE',
    },
    whyFactors: {
      soilFactor: 'Utilizes sterilized agricultural waste (wheat straw, soybean haulm) rather than arable open topsoil, maximizing land productivity.',
      climateFactor: 'Can be grown indoors under controlled temperature (18-24°C) and 85-90% relative humidity even on smallholdings.',
      waterFactor: 'Minimal water consumption compared to field crops; utilizes micro-misting.',
      economicFactor: 'Extraordinary profit margins (₹140-₹200/kg) serving urban hotels, supermarkets, and health food processors with daily harvesting.',
    },
    recommendedSowingWindow: 'Year-round under shed; peak natural season October to March',
    icarAdvisory: 'DMR Solan: Maintain strict pasteurization of compost; prevent cross-contamination by maintaining 85% relative humidity with clean ventilation.',
  },
  Maize: {
    cropName: 'Maize',
    category: 'GRAIN',
    hindiName: 'मक्का',
    marathiName: 'मका',
    preferredSoils: ['Red Loamy Soil', 'Alluvial Soil', 'Clay Loam'],
    optimalPhRange: [5.8, 7.5],
    tempRangeOptimalC: [20, 32],
    waterRequirementMm: [500, 800],
    irrigationSensitivity: 'MODERATE',
    growingDurationDays: [95, 115],
    avgCultivationCostPerAcre: 13000,
    expectedYieldQuintalsPerAcre: [16.0, 26.0],
    expectedPricePerQuintal: [2100, 2500],
    mspPerQuintal: 2225,
    marketDemandRating: 'HIGH',
    riskProfile: {
      pestRisk: 'MODERATE', // Fall armyworm
      climateRisk: 'LOW',
      priceVolatility: 'LOW',
    },
    whyFactors: {
      soilFactor: 'Adaptable to well-drained loams; responds vigorously to balanced NPK application.',
      climateFactor: 'C4 plant architecture delivers superior photosynthetic efficiency under high light intensity.',
      waterFactor: 'Resilient to intermittent dry spells; critical water stages are silking and tasseling.',
      economicFactor: 'Strong recurring poultry feed, starch processing, and ethanol distillery demand across western and southern corridors.',
    },
    recommendedSowingWindow: 'June 20 – July 15 (Kharif) or October 15 – November 15 (Rabi)',
    icarAdvisory: 'IIMR: Monitor early for Fall Armyworm (FAW) whorl feeding; apply neem-based formulation (Azadirachtin 1500 ppm).',
  },
  Onion: {
    cropName: 'Onion',
    category: 'VEGETABLE',
    hindiName: 'प्याज',
    marathiName: 'कांदा',
    preferredSoils: ['Black Cotton Soil', 'Clay Loam', 'Sandy Loam'],
    optimalPhRange: [6.2, 7.5],
    tempRangeOptimalC: [15, 30],
    waterRequirementMm: [400, 650],
    irrigationSensitivity: 'HIGH',
    growingDurationDays: [110, 135],
    avgCultivationCostPerAcre: 28000,
    expectedYieldQuintalsPerAcre: [70.0, 110.0],
    expectedPricePerQuintal: [1800, 3200],
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'MODERATE', // Thrips, purple blotch
      climateRisk: 'HIGH', // Unseasonal hail/rain
      priceVolatility: 'HIGH',
    },
    whyFactors: {
      soilFactor: 'Friable loam allows unrestricted bulb expansion and firm neck formation for extended storage.',
      climateFactor: 'Mild winter conditions in Nashik/Ahmednagar promote high dry matter accumulation and pungent flavor.',
      waterFactor: 'Frequent shallow micro-sprinkler or drip irrigations maintain optimal topsoil root moisture without waterlogging.',
      economicFactor: 'High cash yield per acre with established post-harvest cold storage and national export corridors.',
    },
    recommendedSowingWindow: 'Late Kharif (Sept-Oct) or Rabi (Nov-Dec)',
    icarAdvisory: 'DOGR Pune: Treat nursery seedlings with Trichoderma viride; cure harvested bulbs under shade for 7-10 days before bagging.',
  },
  Tomato: {
    cropName: 'Tomato',
    category: 'VEGETABLE',
    hindiName: 'टमाटर',
    marathiName: 'टोमॅटो',
    preferredSoils: ['Clay Loam', 'Red Loamy Soil', 'Alluvial Soil'],
    optimalPhRange: [6.0, 7.2],
    tempRangeOptimalC: [18, 30],
    waterRequirementMm: [600, 900],
    irrigationSensitivity: 'HIGH',
    growingDurationDays: [120, 150],
    avgCultivationCostPerAcre: 35000,
    expectedYieldQuintalsPerAcre: [110.0, 180.0],
    expectedPricePerQuintal: [1200, 2800],
    marketDemandRating: 'VERY_HIGH',
    riskProfile: {
      pestRisk: 'HIGH', // Fruit borer, leaf curl virus
      climateRisk: 'HIGH',
      priceVolatility: 'HIGH',
    },
    whyFactors: {
      soilFactor: 'Fertile loams with good organic matter provide the balanced calcium required to prevent blossom end rot.',
      climateFactor: 'Warm sunny days with cooler nights enhance lycopene synthesis and firm fruit pulp.',
      waterFactor: 'Drip fertigation maintains steady soil moisture tension, preventing fruit cracking during ripening.',
      economicFactor: 'Tremendous revenue upside (₹1.5L – ₹3L per acre) when timed to harvest during major urban market price peaks.',
    },
    recommendedSowingWindow: 'August – September (Rabi) or May – June (Kharif)',
    icarAdvisory: 'IIHR: Stake indeterminate varieties with trellis wiring; apply calcium nitrate spray at fruit set to safeguard firmness.',
  },
  Chickpea: {
    cropName: 'Chickpea (Gram)',
    category: 'PULSE',
    hindiName: 'चना',
    marathiName: 'हरभरा (चना)',
    preferredSoils: ['Black Cotton Soil', 'Red Loamy Soil', 'Clay Loam'],
    optimalPhRange: [6.2, 8.0],
    tempRangeOptimalC: [15, 28],
    waterRequirementMm: [250, 400],
    irrigationSensitivity: 'LOW',
    growingDurationDays: [95, 110],
    avgCultivationCostPerAcre: 9500,
    expectedYieldQuintalsPerAcre: [6.5, 10.5],
    expectedPricePerQuintal: [5200, 6100],
    mspPerQuintal: 5650, // 2024-25 Rabi MSP
    marketDemandRating: 'HIGH',
    riskProfile: {
      pestRisk: 'MODERATE', // Pod borer (Helicoverpa)
      climateRisk: 'LOW',
      priceVolatility: 'LOW',
    },
    whyFactors: {
      soilFactor: 'Deep taproot system thrives on residual soil moisture of vertisols following Kharif soybean harvest.',
      climateFactor: 'Cool dry weather during vegetative development prevents vegetative blight and stimulates heavy flowering.',
      waterFactor: 'Extremely drought hardy; requires only 1-2 light irrigations (branching and pod development).',
      economicFactor: 'High market liquidity, low input expense (₹9,500/acre), and firm MSP floor guarantee positive net margins.',
    },
    recommendedSowingWindow: 'October 15 – November 10',
    icarAdvisory: 'IIPR: Install 4-5 pheromone traps per acre for Helicoverpa monitoring; nip terminal shoots at 30 days to boost branching.',
  },
  Groundnut: {
    cropName: 'Groundnut',
    category: 'OILSEED',
    hindiName: 'मूंगफली',
    marathiName: 'भुईमूग',
    preferredSoils: ['Sandy Loam', 'Red Loamy Soil'],
    optimalPhRange: [6.0, 7.2],
    tempRangeOptimalC: [22, 32],
    waterRequirementMm: [450, 650],
    irrigationSensitivity: 'MODERATE',
    growingDurationDays: [105, 125],
    avgCultivationCostPerAcre: 15000,
    expectedYieldQuintalsPerAcre: [8.0, 13.0],
    expectedPricePerQuintal: [6200, 7200],
    mspPerQuintal: 6783,
    marketDemandRating: 'HIGH',
    riskProfile: {
      pestRisk: 'LOW',
      climateRisk: 'MODERATE',
      priceVolatility: 'LOW',
    },
    whyFactors: {
      soilFactor: 'Light, well-drained friable sandy loams allow seamless peg penetration and well-formed underground pods.',
      climateFactor: 'Requires warm temperatures throughout its cycle for high oil percentage and kernel plumpness.',
      waterFactor: 'Tolerates moderate dry spells; gypsum application at flowering ensures healthy shell calcification.',
      economicFactor: 'Premium demand from edible oil millers and export confectionery markets with dependable MSP floor.',
    },
    recommendedSowingWindow: 'June 15 – July 10 (Kharif) or January – February (Summer groundnut)',
    icarAdvisory: 'DGR Junagadh: Apply 200 kg gypsum per acre at 30-35 DAS (pegging stage); treat seed with Trichoderma and Rhizobium.',
  },
};

// 3. Indian State & District Administrative Hierarchy with Soil and Climate Attributes
export const INDIA_LOCATIONS_HIERARCHY: LocationHierarchyState[] = [
  {
    stateName: 'Maharashtra',
    stateCode: 'MH',
    districts: [
      {
        districtName: 'Nashik',
        talukas: ['Niphad', 'Dindori', 'Sinnar', 'Yeola', 'Kalwan', 'Baglan', 'Malegaon', 'Nashik', 'Chandwad'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 780,
        avgTempRange: { min: 14, max: 34 },
        irrigationCoveragePercent: 58,
        historicalYields: {
          Tomato: 11200,
          Onion: 7400,
          Wheat: 980,
          Soybean: 510,
          Cotton: 420,
          Maize: 1250,
          Mushroom: 4500,
          Chickpea: 440,
        },
      },
      {
        districtName: 'Pune',
        talukas: ['Baramati', 'Haveli', 'Shirur', 'Junnar', 'Purandar', 'Khed', 'Indapur', 'Daund'],
        dominantSoil: 'Clay Loam',
        annualRainfallMm: 720,
        avgTempRange: { min: 15, max: 35 },
        irrigationCoveragePercent: 62,
        historicalYields: {
          Tomato: 10800,
          Onion: 6900,
          Wheat: 1050,
          Soybean: 530,
          Cotton: 380,
          Maize: 1320,
          Mushroom: 4800,
          Chickpea: 460,
        },
      },
      {
        districtName: 'Akola',
        talukas: ['Akola', 'Akot', 'Balapur', 'Barshitakli', 'Murtizapur', 'Patur', 'Telhara'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 820,
        avgTempRange: { min: 16, max: 41 },
        irrigationCoveragePercent: 32,
        historicalYields: {
          Cotton: 510,
          Soybean: 540,
          Wheat: 890,
          Chickpea: 490,
          Maize: 1100,
          Onion: 5200,
          Mushroom: 3900,
        },
      },
      {
        districtName: 'Nagpur',
        talukas: ['Nagpur Rural', 'Katol', 'Saoner', 'Ramtek', 'Hingna', 'Umred', 'Narkhed', 'Kalmeshwar'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 1050,
        avgTempRange: { min: 15, max: 42 },
        irrigationCoveragePercent: 38,
        historicalYields: {
          Cotton: 530,
          Soybean: 560,
          Wheat: 920,
          Chickpea: 470,
          Maize: 1150,
          Mushroom: 4400,
        },
      },
      {
        districtName: 'Amravati',
        talukas: ['Amravati', 'Achalpur', 'Morshi', 'Warud', 'Chandur Bazar', 'Daryapur', 'Anjangaon'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 880,
        avgTempRange: { min: 16, max: 40 },
        irrigationCoveragePercent: 34,
        historicalYields: {
          Soybean: 570,
          Cotton: 500,
          Chickpea: 480,
          Wheat: 880,
          Mushroom: 4100,
        },
      },
      {
        districtName: 'Ahmednagar',
        talukas: ['Rahata', 'Shrirampur', 'Sangamner', 'Newasa', 'Shevgaon', 'Kopargaon', 'Parner'],
        dominantSoil: 'Clay Loam',
        annualRainfallMm: 620,
        avgTempRange: { min: 14, max: 36 },
        irrigationCoveragePercent: 52,
        historicalYields: {
          Onion: 7100,
          Wheat: 1020,
          Soybean: 490,
          Cotton: 440,
          Chickpea: 430,
          Tomato: 9200,
          Mushroom: 4200,
        },
      },
      {
        districtName: 'Solapur',
        talukas: ['Barshi', 'Karmala', 'Pandharpur', 'Madha', 'Malshiras', 'Sangola', 'Mohol'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 580,
        avgTempRange: { min: 17, max: 39 },
        irrigationCoveragePercent: 44,
        historicalYields: {
          Onion: 6500,
          Chickpea: 420,
          Wheat: 860,
          Soybean: 460,
          Cotton: 390,
          Groundnut: 610,
        },
      },
      {
        districtName: 'Kolhapur',
        talukas: ['Karvir', 'Shirol', 'Hatkanangle', 'Kagal', 'Radhanagari', 'Panhala', 'Gadhinglaj'],
        dominantSoil: 'Clay Loam',
        annualRainfallMm: 1150,
        avgTempRange: { min: 18, max: 34 },
        irrigationCoveragePercent: 74,
        historicalYields: {
          Soybean: 610,
          Wheat: 990,
          Maize: 1450,
          Groundnut: 670,
          Mushroom: 4700,
        },
      },
      {
        districtName: 'Jalgaon',
        talukas: ['Jalgaon', 'Raver', 'Bhusawal', 'Chalisgaon', 'Pachora', 'Jamner', 'Yawal', 'Chopda'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 740,
        avgTempRange: { min: 15, max: 40 },
        irrigationCoveragePercent: 48,
        historicalYields: {
          Cotton: 560,
          Maize: 1350,
          Soybean: 490,
          Wheat: 950,
          Chickpea: 440,
        },
      },
    ],
  },
  {
    stateName: 'Madhya Pradesh',
    stateCode: 'MP',
    districts: [
      {
        districtName: 'Indore',
        talukas: ['Indore', 'Mhow', 'Sanwer', 'Depalpur'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 920,
        avgTempRange: { min: 13, max: 37 },
        irrigationCoveragePercent: 65,
        historicalYields: {
          Soybean: 580,
          Wheat: 1450,
          Chickpea: 520,
          Cotton: 490,
          Mushroom: 4600,
        },
      },
      {
        districtName: 'Ujjain',
        talukas: ['Ujjain', 'Badnagar', 'Khachrod', 'Mahidpur', 'Tarana'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 860,
        avgTempRange: { min: 12, max: 38 },
        irrigationCoveragePercent: 60,
        historicalYields: {
          Soybean: 560,
          Wheat: 1480,
          Chickpea: 510,
          Cotton: 470,
        },
      },
    ],
  },
  {
    stateName: 'Gujarat',
    stateCode: 'GJ',
    districts: [
      {
        districtName: 'Surat',
        talukas: ['Chorasi', 'Olpad', 'Kamrej', 'Bardoli', 'Mahuva'],
        dominantSoil: 'Alluvial Soil',
        annualRainfallMm: 1100,
        avgTempRange: { min: 18, max: 36 },
        irrigationCoveragePercent: 78,
        historicalYields: {
          Cotton: 680,
          Sugarcane: 32000,
          Wheat: 1200,
          Groundnut: 720,
        },
      },
      {
        districtName: 'Rajkot',
        talukas: ['Rajkot', 'Gondal', 'Jasdan', 'Jetpur', 'Dhoraji'],
        dominantSoil: 'Black Cotton Soil',
        annualRainfallMm: 620,
        avgTempRange: { min: 16, max: 39 },
        irrigationCoveragePercent: 55,
        historicalYields: {
          Cotton: 720,
          Groundnut: 790,
          Wheat: 1150,
          Chickpea: 480,
        },
      },
    ],
  },
  {
    stateName: 'Punjab',
    stateCode: 'PB',
    districts: [
      {
        districtName: 'Ludhiana',
        talukas: ['Ludhiana East', 'Ludhiana West', 'Jagraon', 'Samrala', 'Khanna'],
        dominantSoil: 'Alluvial Soil',
        annualRainfallMm: 680,
        avgTempRange: { min: 8, max: 38 },
        irrigationCoveragePercent: 99,
        historicalYields: {
          Wheat: 2150,
          Maize: 1850,
          Cotton: 620,
          Mushroom: 5600,
        },
      },
    ],
  },
];
