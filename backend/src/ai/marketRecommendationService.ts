/**
 * Best Market Recommendation Engine
 * Calculates net realization for a given crop batch across regional wholesale markets:
 * Net Realization = Gross Price - Freight/Transport Cost - Platform Fee
 * Ranks markets by Net Realization and articulates transparent trade-offs.
 */

export interface MarketOption {
  marketId: string;
  marketName: string;
  region: string;
  distanceKm: number;
  grossPricePerKg: number;
  transportCostPerKg: number;
  platformFeePerKg: number;
  netRealizationPerKg: number;
  totalPotentialNetRevenue: number;
  transitHours: number;
  isBestMarket: boolean;
  notes: string;
}

export interface BestMarketResult {
  originLocation: string;
  cropName: string;
  quantityKg: number;
  grade: string;
  bestMarket: MarketOption;
  alternativeMarkets: MarketOption[];
  rationale: string;
  interDistrictArbitrageInsight: string;
  isPrototypeAI: boolean;
}

// Distance & Freight calculation benchmarks from major agricultural hubs
interface MarketDistanceProfile {
  name: string;
  region: string;
  lat: number;
  lng: number;
  distFromNashik: number;
  distFromPune: number;
  distFromAmravati: number;
  basePrices: Record<string, number>;
}

const REGIONAL_MARKETS: MarketDistanceProfile[] = [
  {
    name: 'Amravati APMC Cotton Yard',
    region: 'Amravati',
    lat: 20.932,
    lng: 77.758,
    distFromNashik: 520,
    distFromPune: 560,
    distFromAmravati: 10,
    basePrices: { Cotton: 66.5, Soybean: 47.0, Wheat: 28.5, Tomato: 26.0, Onion: 29.0 },
  },
  {
    name: 'Akola Cotton & Grain Mandi',
    region: 'Akola',
    lat: 20.705,
    lng: 77.012,
    distFromNashik: 440,
    distFromPune: 490,
    distFromAmravati: 85,
    basePrices: { Cotton: 65.0, Soybean: 46.5, Wheat: 28.0, Tomato: 25.5, Onion: 28.5 },
  },
  {
    name: 'Nagpur Kalamna Market',
    region: 'Nagpur',
    lat: 21.172,
    lng: 79.145,
    distFromNashik: 640,
    distFromPune: 710,
    distFromAmravati: 155,
    basePrices: { Cotton: 68.0, Soybean: 48.0, Wheat: 30.5, Tomato: 28.0, Onion: 30.0, Potato: 23.0, Cabbage: 16.0 },
  },
  {
    name: 'Nashik APMC (Dindori Road)',
    region: 'Nashik',
    lat: 20.011,
    lng: 73.791,
    distFromNashik: 15,
    distFromPune: 210,
    distFromAmravati: 520,
    basePrices: { Tomato: 25.0, Onion: 28.0, Potato: 21.0, Wheat: 24.0, Cotton: 63.0, Soybean: 44.0, Cabbage: 15.0 },
  },
  {
    name: 'Pune Gultekdi Market Yard',
    region: 'Pune',
    lat: 18.498,
    lng: 73.864,
    distFromNashik: 210,
    distFromPune: 12,
    distFromAmravati: 560,
    basePrices: { Tomato: 30.0, Onion: 31.5, Potato: 24.0, Wheat: 25.5, Cotton: 64.5, Soybean: 45.5, Cabbage: 18.0 },
  },
  {
    name: 'Vashi APMC Navi Mumbai',
    region: 'Mumbai',
    lat: 19.073,
    lng: 72.998,
    distFromNashik: 165,
    distFromPune: 145,
    distFromAmravati: 630,
    basePrices: { Tomato: 34.0, Onion: 35.0, Potato: 27.0, Wheat: 27.0, Cotton: 65.0, Soybean: 46.0, Cabbage: 20.0 },
  },
  {
    name: 'Surat Sardar Market Yard',
    region: 'Surat',
    lat: 21.195,
    lng: 72.84,
    distFromNashik: 240,
    distFromPune: 420,
    distFromAmravati: 580,
    basePrices: { Tomato: 33.0, Onion: 33.5, Potato: 26.0, Wheat: 26.5, Cotton: 67.0, Soybean: 46.5, Cabbage: 18.5 },
  },
];

export function recommendBestMarket(
  origin: string,
  cropName: string,
  quantityKg: number = 2000,
  grade: string = 'GRADE_A'
): BestMarketResult {
  const originLower = (origin || '').toLowerCase();
  const isFromAmravati = originLower.includes('amravati') || originLower.includes('akola') || originLower.includes('nagpur') || originLower.includes('vidarbha') || originLower.includes('wardha') || originLower.includes('yavatmal');
  const isFromNashik = originLower.includes('nashik') || originLower.includes('dindori') || originLower.includes('niphad') || originLower.includes('yeola') || originLower.includes('sinnar');
  const gradeFactor = grade === 'GRADE_A' ? 1.0 : grade === 'GRADE_B' ? 0.92 : 0.82;

  const marketOptions: MarketOption[] = REGIONAL_MARKETS.map((m, idx) => {
    const distance = isFromAmravati ? m.distFromAmravati : isFromNashik ? m.distFromNashik : m.distFromPune;
    const baseGross = (m.basePrices[cropName] || 26.0) * gradeFactor;
    const grossPrice = Math.round(baseGross * 10) / 10;

    // Transport calculation: base loading ₹0.5/kg + ₹0.038 per km
    let transportCost = Math.round((0.5 + distance * 0.038) * 10) / 10;
    if (distance <= 20) transportCost = 1.0;
    else if (distance <= 180) transportCost = Math.min(transportCost, 7.0);
    else if (distance <= 220) transportCost = Math.min(transportCost, 4.0); // optimized Nashik-Pune corridor
    else if (distance <= 260) transportCost = Math.min(transportCost, 9.0);

    const platformFee = 1.0;
    const netRealization = Math.round((grossPrice - transportCost - platformFee) * 10) / 10;
    const totalPotentialNet = Math.round(netRealization * quantityKg);
    const transitHours = Math.max(1, Math.round((distance / 45) * 10) / 10);

    return {
      marketId: `mkt-${idx + 1}`,
      marketName: m.name,
      region: m.region,
      distanceKm: distance,
      grossPricePerKg: grossPrice,
      transportCostPerKg: transportCost,
      platformFeePerKg: platformFee,
      netRealizationPerKg: netRealization,
      totalPotentialNetRevenue: totalPotentialNet,
      transitHours,
      isBestMarket: false,
      notes: distance < 30 ? 'Local Mandi (Lowest freight)' : 'Inter-district terminal yard',
    };
  });

  // Sort strictly by Net Realization descending
  marketOptions.sort((a, b) => b.netRealizationPerKg - a.netRealizationPerKg);
  marketOptions[0].isBestMarket = true;

  const best = marketOptions[0];
  const localOption = marketOptions.find((m) => m.distanceKm < 30) || marketOptions[marketOptions.length - 1];
  const netGainVsLocal = Math.round((best.netRealizationPerKg - localOption.netRealizationPerKg) * 10) / 10;
  const extraRevenueTotal = Math.round(netGainVsLocal * quantityKg);

  let rationale = `Although ${best.region} has higher transport cost (₹${best.transportCostPerKg}/kg), the premium selling price (₹${best.grossPricePerKg}/kg) produces the highest net realization of ₹${best.netRealizationPerKg}/kg.`;
  if (best.region === localOption.region) {
    rationale = `Local ${best.region} mandi yields highest net margins because transport savings (₹${best.transportCostPerKg}/kg) fully retain value without distance penalty.`;
  }

  const interDistrictArbitrageInsight = `Routing ${quantityKg.toLocaleString()} kg to ${best.marketName} yields +₹${extraRevenueTotal.toLocaleString()} in net profit compared to standard local mandi liquidation.`;

  return {
    originLocation: origin,
    cropName,
    quantityKg,
    grade,
    bestMarket: best,
    alternativeMarkets: marketOptions.slice(1),
    rationale,
    interDistrictArbitrageInsight,
    isPrototypeAI: true,
  };
}
