export type Role = 'FARMER' | 'FPO' | 'BUYER' | 'CONSUMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  location: string;
  farmerProfile?: {
    farmLocation: string;
    farmSizeAcres: number;
    preferredCrops: string;
    trustScore: number;
    fulfillmentRate: number;
    totalEarnings: number;
  };
  buyerProfile?: {
    businessName: string;
    buyerType: string;
    location: string;
    trustScore: number;
    paymentScore: number;
  };
  fpoProfile?: {
    fpoName: string;
    location: string;
    memberCount: number;
    trustScore: number;
    members?: FPOMember[];
  };
  consumerProfile?: {
    address?: string;
  };
}

export interface FPOMember {
  id: string;
  name: string;
  location: string;
  crop: string;
  quantityKg: number;
  landAcres: number;
}

export interface CropBatch {
  id: string;
  farmerId?: string;
  cropName: string;
  category: string;
  quantityKg: number;
  remainingKg: number;
  unit: string;
  grade: string;
  perishability: string;
  shelfLifeHours: number;
  harvestDate: string;
  expectedSellingDate: string;
  location: string;
  storageAvailable: boolean;
  passportCode: string;
  imageUrl?: string;
  status: string;
  passport?: CropPassport;
  farmer?: {
    name: string;
    location: string;
    mobile: string;
  };
}

export interface CropPassport {
  id?: string;
  passportCode: string;
  cropBatchId?: string;
  cropName: string;
  farmerName: string;
  farmLocation: string;
  harvestDate: string;
  grade: string;
  shelfLifeHours: number;
  currentOwner: string;
  destination: string;
  transportType: string;
  provenanceJson: string;
}

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
}

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

export interface FairPriceResult {
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
}

export interface DayForecast {
  dayLabel: string;
  dayOffset: number;
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidencePercent: number;
}

export interface PriceForecastResult {
  cropName: string;
  location: string;
  currentPrice: number;
  predictedPrice: number;
  expectedRange: { min: number; max: number };
  confidencePercent: number;
  trendPercent: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  recommendation: string;
  explanation: string;
  forecasts: DayForecast[];
}

export interface DemandForecastResult {
  cropName: string;
  region: string;
  currentDemandPercent: number;
  predicted7dDemand: number;
  predicted30dDemand: number;
  supplyIndexPercent: number;
  shortageSurplusGapPercent: number;
  gapStatus: string;
  alertLevel: string;
  recommendation: string;
  crossDistrictOpportunity?: string;
  timeline: {
    period: string;
    demand: number;
    supply: number;
    projectedPrice: number;
  }[];
}

export interface WowMomentCockpit {
  harvest: {
    cropName: string;
    quantityKg: number;
    location: string;
    grade: string;
    harvestWindow: string;
    shelfLifeHours: number;
    passportCode: string;
  };
  marketIntelligence: {
    demandLevel: string;
    currentPrice: number;
    predictedPrice: number;
    trendPercent: number;
    fairPriceRange: string;
    recommendation: string;
    explanation: string;
  };
  bestMarket: {
    marketName: string;
    grossPrice: number;
    transportCost: number;
    platformFee: number;
    netRealization: number;
    totalPotentialNet: number;
    explanation: string;
    distanceKm?: number;
  };
  bestBuyer: {
    buyerName: string;
    matchScore: number;
    offerPrice: number;
    distanceKm: number;
    requiredDate: string;
    qualityReq: string;
  };
  smartLogistics: {
    status: string;
    truckCapacityKg: number;
    truckUtilizedKg: number;
    utilizationPercent: number;
    estimatedSavingsAmount: number;
    separateFreight: number;
    consolidatedFreight: number;
  };
}

export interface Order {
  id: string;
  buyerId: string;
  farmerId: string;
  cropName: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  estimatedDeliveryDate: string;
  paymentStatus: string;
  escrowAmount: number;
  buyer?: { name: string; location: string; buyerProfile?: any };
  farmer?: { name: string; location: string; farmerProfile?: any };
  cropBatch?: CropBatch;
  shipment?: Shipment;
  transaction?: Transaction;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  trackingCode: string;
  originLocation: string;
  destinationLocation: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  currentStage: string;
  progressPercent: number;
  isConsolidated: boolean;
  consolidatedFarmers?: string;
  savingsAmount: number;
  truckCapacityKg: number;
  truckUtilizedKg: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  cropName: string;
  quantityKg: number;
  consumerPricePerKg: number;
  farmerPricePerKg: number;
  transportCostPerKg: number;
  storageCostPerKg: number;
  processingCostPerKg: number;
  retailCostPerKg: number;
  platformFeePerKg: number;
  farmerSharePercent: number;
  consumerSavingsPercent: number;
  intermediariesEliminated: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'MARKET' | 'ORDERS' | 'OFFERS' | 'LOGISTICS' | 'AI' | 'SYSTEM';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface FairPriceCardData {
  cropName: string;
  offeredPrice: number;
  fairPriceMin: number;
  fairPriceMax: number;
  fairPriceTarget: number;
  status: 'BELOW_FAIR_PRICE' | 'FAIR_PRICE' | 'ABOVE_FAIR_PRICE';
  statusLabel: string;
  potentialLossAmount: number;
  counterOfferSuggestion: string;
  explanation: string;
  mandiComparison: {
    localMandi: string;
    localPrice: number;
    bestMetroMandi: string;
    bestMetroPrice: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  fairPriceCard?: FairPriceCardData;
  matchedEntities?: {
    type: 'BUYER' | 'FARMER' | 'FPO';
    items: Array<any>;
  };
  suggestedQuestions?: string[];
}

export interface DirectoryData {
  farmers: Array<{
    id: string;
    name: string;
    village: string;
    district: string;
    phone: string;
    landAcres: number;
    primaryCrop: string;
    secondaryCrop: string;
    fpoAffiliation: string;
    trustScore: number;
  }>;
  buyers: Array<{
    id: string;
    businessName: string;
    buyerType: string;
    location: string;
    phone: string;
    requirementCrop: string;
    volumeKgPerMonth: number;
    budgetPerKg: number;
    rating: number;
  }>;
  fpos: Array<{
    id: string;
    name: string;
    registrationNo: string;
    district: string;
    memberFarmers: number;
    primaryCrops: string;
    contactPerson: string;
    phone: string;
  }>;
  admins: Array<{
    id: string;
    name: string;
    role: string;
    regionScope: string;
    email: string;
    phone: string;
  }>;
}
