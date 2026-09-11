import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  MAHARASHTRA_FARMERS,
  MAHARASHTRA_BUYERS,
  MAHARASHTRA_FPOS,
  MAHARASHTRA_ADMINS,
} from '../src/data/maharashtraDirectory';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FARM2MARKET SmartMandi live database with 120 Farmers, 10 Buyers, 6 FPOs, 4 Admins...');

  // Clean all existing records
  await prisma.transaction.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.negotiation.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.qualityObservation.deleteMany();
  await prisma.qualityInspectionImage.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.qualityPriceRule.deleteMany();
  await prisma.cropQualityProfile.deleteMany();
  await prisma.cropPlan.deleteMany();
  await prisma.cropPassport.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.cropBatch.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.buyerRequirement.deleteMany();
  await prisma.demandForecast.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.market.deleteMany();
  await prisma.region.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.fPOMember.deleteMany();
  await prisma.fPOProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.consumerProfile.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.user.deleteMany();

  const farmerHashedPassword = await bcrypt.hash('farmer@123', 10);
  const buyerHashedPassword = await bcrypt.hash('byer123', 10);
  const fpoHashedPassword = await bcrypt.hash('fpo123', 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  const defaultHashedPassword = await bcrypt.hash('password123', 10);
  const now = new Date();

  // 1. Seed Master Crops Catalog
  console.log('🌾 Seeding Crops Master Catalog...');
  const cropsMaster = [
    {
      cropName: 'Cotton',
      category: 'Fiber',
      season: 'KHARIF',
      typicalYieldPerAcreKg: 850,
      baseMspPerQuintal: 8667, // MSP 2024-25 for Long Staple
      modalMarketPricePerKg: 86.5,
      shelfLifeHours: 720,
      perishability: 'LOW',
      description: 'Bt Long Staple Cotton with high fiber strength and ginning outturn (Amravati & Vidarbha belt).',
      imageUrl: 'https://www.renature.co/wp-content/uploads/2023/07/cotton-1.jpeg',
    },
    {
      cropName: 'Soybean',
      category: 'Oilseed',
      season: 'KHARIF',
      typicalYieldPerAcreKg: 950,
      baseMspPerQuintal: 4892,
      modalMarketPricePerKg: 48.5,
      shelfLifeHours: 720,
      perishability: 'LOW',
      description: 'Yellow Soybean JS-335 with high oil and protein content (Vidarbha & Marathwada).',
      imageUrl: 'https://www.news-medical.net/images/news/ImageForNews_745986_16823072833517897.jpg',
    },
    {
      cropName: 'Wheat',
      category: 'Grain',
      season: 'RABI',
      typicalYieldPerAcreKg: 1400,
      baseMspPerQuintal: 2425,
      modalMarketPricePerKg: 31.0,
      shelfLifeHours: 1440,
      perishability: 'LOW',
      description: 'Sharbati & Lokwan premium wheat grains with high gluten and nutritional density.',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Tomato',
      category: 'Vegetable',
      season: 'YEAR_ROUND',
      typicalYieldPerAcreKg: 9000,
      baseMspPerQuintal: 1800,
      modalMarketPricePerKg: 28.0,
      shelfLifeHours: 72,
      perishability: 'HIGH',
      description: 'Abhinav & Saaho red salad tomatoes with firm pericarp and high lycopene.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Onion',
      category: 'Vegetable',
      season: 'RABI',
      typicalYieldPerAcreKg: 7500,
      baseMspPerQuintal: 2200,
      modalMarketPricePerKg: 34.0,
      shelfLifeHours: 720,
      perishability: 'LOW',
      description: 'Nashik Red Onion with tight dry skins and long storage stability.',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Grapes',
      category: 'Fruit',
      season: 'RABI',
      typicalYieldPerAcreKg: 6500,
      baseMspPerQuintal: 4500,
      modalMarketPricePerKg: 78.0,
      shelfLifeHours: 120,
      perishability: 'HIGH',
      description: 'Nashik Thomson Seedless export table grapes with 18+ Brix sweetness.',
      imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Banana',
      category: 'Fruit',
      season: 'YEAR_ROUND',
      typicalYieldPerAcreKg: 18000,
      baseMspPerQuintal: 1500,
      modalMarketPricePerKg: 24.0,
      shelfLifeHours: 96,
      perishability: 'VERY_HIGH',
      description: 'Jalgaon Grand Naine tissue-culture bananas with uniform cylindrical fingers.',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Chickpea',
      category: 'Pulse',
      season: 'RABI',
      typicalYieldPerAcreKg: 900,
      baseMspPerQuintal: 5440,
      modalMarketPricePerKg: 61.0,
      shelfLifeHours: 1440,
      perishability: 'LOW',
      description: 'Desi Vijay & Digvijay Chickpea (Gram/Chana) with high protein.',
      imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Sugarcane',
      category: 'Commercial',
      season: 'YEAR_ROUND',
      typicalYieldPerAcreKg: 40000,
      baseMspPerQuintal: 340,
      modalMarketPricePerKg: 3.4,
      shelfLifeHours: 48,
      perishability: 'HIGH',
      description: 'Co-86032 high recovery sugarcane for jaggery and sugar extraction.',
      imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&auto=format&fit=crop&q=80',
    },
    {
      cropName: 'Orange',
      category: 'Fruit',
      season: 'KHARIF',
      typicalYieldPerAcreKg: 5000,
      baseMspPerQuintal: 3800,
      modalMarketPricePerKg: 48.0,
      shelfLifeHours: 168,
      perishability: 'MEDIUM',
      description: 'Nagpur & Amravati Mandarin Oranges with sweet-acid balance.',
      imageUrl: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80',
    },
  ];

  for (const c of cropsMaster) {
    await prisma.crop.create({ data: c });
  }

  // 2. Quality Profiles & Price Rules
  console.log('🔬 Seeding Quality Profiles & Price Rules...');
  await prisma.cropQualityProfile.create({
    data: {
      cropName: 'Cotton',
      category: 'Fiber',
      primaryFeatureName: 'Fiber Whiteness & Lint Uniformity',
      featureCriteriaJson: JSON.stringify({
        gradeA: { minScore: 88, maxTrashPercent: 2.0, minStapleLengthMm: 30.5 },
        gradeB: { minScore: 78, maxTrashPercent: 4.5, minStapleLengthMm: 28.0 },
        gradeC: { minScore: 60, maxTrashPercent: 8.0, minStapleLengthMm: 25.0 },
      }),
      priceRules: {
        create: [
          { grade: 'GRADE_A', minQualityScore: 88, maxQualityScore: 100, priceAdjustmentPercent: 5.0, description: 'Premium ginning export lint quality' },
          { grade: 'GRADE_B', minQualityScore: 75, maxQualityScore: 87.9, priceAdjustmentPercent: 0.0, description: 'Standard mandi benchmark quality' },
          { grade: 'GRADE_C', minQualityScore: 50, maxQualityScore: 74.9, priceAdjustmentPercent: -8.0, description: 'Higher leaf/trash presence discount' },
        ],
      },
    },
  });

  await prisma.cropQualityProfile.create({
    data: {
      cropName: 'Tomato',
      category: 'Vegetable',
      primaryFeatureName: 'Lycopene Pigment & Skin Firmness',
      featureCriteriaJson: JSON.stringify({
        gradeA: { minScore: 88, minFirmnessKg: 4.5, maxDefectsPercent: 3.0 },
        gradeB: { minScore: 76, minFirmnessKg: 3.8, maxDefectsPercent: 8.0 },
        gradeC: { minScore: 60, minFirmnessKg: 3.0, maxDefectsPercent: 18.0 },
      }),
      priceRules: {
        create: [
          { grade: 'GRADE_A', minQualityScore: 88, maxQualityScore: 100, priceAdjustmentPercent: 8.0, description: 'Export & Premium Retail Supermarket' },
          { grade: 'GRADE_B', minQualityScore: 75, maxQualityScore: 87.9, priceAdjustmentPercent: 0.0, description: 'City wholesale mandi standard' },
          { grade: 'GRADE_C', minQualityScore: 50, maxQualityScore: 74.9, priceAdjustmentPercent: -10.0, description: 'Industrial ketchup processing grade' },
        ],
      },
    },
  });

  // 3. Regions & Mandi Markets
  console.log('📍 Seeding Regions & Mandis...');
  const regionsData = [
    { name: 'Amravati', state: 'Maharashtra', latitude: 20.9374, longitude: 77.7796 },
    { name: 'Akola', state: 'Maharashtra', latitude: 20.7002, longitude: 77.0082 },
    { name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
    { name: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
    { name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
    { name: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
    { name: 'Jalgaon', state: 'Maharashtra', latitude: 21.0077, longitude: 75.5626 },
    { name: 'Kolhapur', state: 'Maharashtra', latitude: 16.705, longitude: 74.2433 },
  ];

  const regions: Record<string, any> = {};
  for (const r of regionsData) {
    regions[r.name] = await prisma.region.create({ data: r });
  }

  const marketsData = [
    {
      name: 'Amravati APMC Cotton Yard',
      regionId: regions['Amravati'].id,
      latitude: 20.942,
      longitude: 77.775,
      distanceFromNashik: 420,
      distanceFromPune: 480,
      transportCostPerKg: 1.0,
      platformFeePerKg: 0.5,
    },
    {
      name: 'Akola APMC Cotton & Grain Market',
      regionId: regions['Akola'].id,
      latitude: 20.708,
      longitude: 77.015,
      distanceFromNashik: 340,
      distanceFromPune: 410,
      transportCostPerKg: 1.8,
      platformFeePerKg: 0.5,
    },
    {
      name: 'Nagpur Kalamna Market Yard',
      regionId: regions['Nagpur'].id,
      latitude: 21.171,
      longitude: 79.135,
      distanceFromNashik: 520,
      distanceFromPune: 580,
      transportCostPerKg: 2.8,
      platformFeePerKg: 0.8,
    },
    {
      name: 'Nashik APMC (Dindori Road)',
      regionId: regions['Nashik'].id,
      latitude: 20.011,
      longitude: 73.791,
      distanceFromNashik: 12,
      distanceFromPune: 210,
      transportCostPerKg: 1.0,
      platformFeePerKg: 0.5,
    },
    {
      name: 'Pune Gultekdi Market Yard',
      regionId: regions['Pune'].id,
      latitude: 18.498,
      longitude: 73.864,
      distanceFromNashik: 210,
      distanceFromPune: 10,
      transportCostPerKg: 1.2,
      platformFeePerKg: 1.0,
    },
    {
      name: 'Vashi APMC Navi Mumbai',
      regionId: regions['Mumbai'].id,
      latitude: 19.073,
      longitude: 72.998,
      distanceFromNashik: 165,
      distanceFromPune: 145,
      transportCostPerKg: 5.5,
      platformFeePerKg: 1.0,
    },
  ];

  const markets: Record<string, any> = {};
  for (const m of marketsData) {
    markets[m.name] = await prisma.market.create({ data: m });
  }

  // Seed Mandi Spot Prices
  const spotPrices = [
    { marketId: markets['Amravati APMC Cotton Yard'].id, cropName: 'Cotton', grade: 'GRADE_A', pricePerKg: 86.5, trendPercent: 2.4 },
    { marketId: markets['Amravati APMC Cotton Yard'].id, cropName: 'Soybean', grade: 'GRADE_A', pricePerKg: 48.5, trendPercent: 1.8 },
    { marketId: markets['Amravati APMC Cotton Yard'].id, cropName: 'Chickpea', grade: 'GRADE_A', pricePerKg: 61.0, trendPercent: 1.5 },
    { marketId: markets['Akola APMC Cotton & Grain Market'].id, cropName: 'Cotton', grade: 'GRADE_A', pricePerKg: 85.0, trendPercent: 1.2 },
    { marketId: markets['Akola APMC Cotton & Grain Market'].id, cropName: 'Soybean', grade: 'GRADE_A', pricePerKg: 48.0, trendPercent: 1.4 },
    { marketId: markets['Nagpur Kalamna Market Yard'].id, cropName: 'Cotton', grade: 'GRADE_A', pricePerKg: 87.2, trendPercent: 3.1 },
    { marketId: markets['Nagpur Kalamna Market Yard'].id, cropName: 'Orange', grade: 'GRADE_A', pricePerKg: 48.0, trendPercent: 2.5 },
    { marketId: markets['Nashik APMC (Dindori Road)'].id, cropName: 'Tomato', grade: 'GRADE_A', pricePerKg: 24.5, trendPercent: 2.1 },
    { marketId: markets['Nashik APMC (Dindori Road)'].id, cropName: 'Onion', grade: 'GRADE_A', pricePerKg: 31.0, trendPercent: 1.5 },
    { marketId: markets['Nashik APMC (Dindori Road)'].id, cropName: 'Grapes', grade: 'GRADE_A', pricePerKg: 78.0, trendPercent: 5.0 },
    { marketId: markets['Pune Gultekdi Market Yard'].id, cropName: 'Tomato', grade: 'GRADE_A', pricePerKg: 28.0, trendPercent: 3.5 },
    { marketId: markets['Pune Gultekdi Market Yard'].id, cropName: 'Onion', grade: 'GRADE_A', pricePerKg: 34.0, trendPercent: 4.2 },
    { marketId: markets['Pune Gultekdi Market Yard'].id, cropName: 'Wheat', grade: 'GRADE_A', pricePerKg: 31.5, trendPercent: 1.9 },
    { marketId: markets['Vashi APMC Navi Mumbai'].id, cropName: 'Cotton', grade: 'GRADE_A', pricePerKg: 91.0, trendPercent: 2.8 },
    { marketId: markets['Vashi APMC Navi Mumbai'].id, cropName: 'Tomato', grade: 'GRADE_A', pricePerKg: 32.0, trendPercent: 4.0 },
    { marketId: markets['Vashi APMC Navi Mumbai'].id, cropName: 'Onion', grade: 'GRADE_A', pricePerKg: 38.0, trendPercent: 3.0 },
  ];

  for (const sp of spotPrices) {
    await prisma.marketPrice.create({ data: sp });
  }

  // 4. Seed Dedicated Demo Farmer: Pranav (fam1 / p@gmail.com / pranav@farm2market.ai)
  console.log('👤 Seeding Demo Farmer: Pranav (fam1, Amravati, Cotton & Soybean)...');
  const pranavUser = await prisma.user.create({
    data: {
      name: 'Pranav',
      email: 'fam1@farm2market.ai',
      password: farmerHashedPassword,
      mobile: '+91 98221 54321',
      role: 'FARMER',
      location: 'Chandur Railway, Amravati, Maharashtra',
      farmerProfile: {
        create: {
          farmLocation: 'Amravati, Maharashtra',
          farmSizeAcres: 5.0,
          preferredCrops: 'Cotton, Soybean, Chickpea',
          trustScore: 96,
          fulfillmentRate: 98.5,
          totalEarnings: 285000.0,
        },
      },
    },
  });

  // Alias accounts for instant login
  await prisma.user.create({
    data: {
      name: 'Pranav',
      email: 'pranav@farm2market.ai',
      password: farmerHashedPassword,
      mobile: '+91 98221 54321',
      role: 'FARMER',
      location: 'Chandur Railway, Amravati, Maharashtra',
      farmerProfile: {
        create: {
          farmLocation: 'Amravati, Maharashtra',
          farmSizeAcres: 5.0,
          preferredCrops: 'Cotton, Soybean, Chickpea',
          trustScore: 96,
          fulfillmentRate: 98.5,
          totalEarnings: 285000.0,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      name: 'Pranav',
      email: 'p@gmail.com',
      password: farmerHashedPassword,
      mobile: '+91 98221 54321',
      role: 'FARMER',
      location: 'Chandur Railway, Amravati, Maharashtra',
      farmerProfile: {
        create: {
          farmLocation: 'Amravati, Maharashtra',
          farmSizeAcres: 5.0,
          preferredCrops: 'Cotton, Soybean, Chickpea',
          trustScore: 96,
          fulfillmentRate: 98.5,
          totalEarnings: 285000.0,
        },
      },
    },
  });

  // Create Pranav's Farm
  const pranavFarm = await prisma.farm.create({
    data: {
      farmerId: pranavUser.id,
      farmName: 'Pranav Vidarbha Farm',
      location: 'Chandur Railway, Amravati, Maharashtra',
      district: 'Amravati',
      state: 'Maharashtra',
      sizeAcres: 5.0,
      soilType: 'Regur Black Cotton Soil',
      irrigationType: 'DRIP_MICRO_IRRIGATION',
      latitude: 20.9374,
      longitude: 77.7796,
    },
  });

  // Batch 1: Pranav's 15 Quintals (1,500 kg) Cotton Batch
  const cottonBatch = await prisma.cropBatch.create({
    data: {
      farmerId: pranavUser.id,
      farmId: pranavFarm.id,
      cropName: 'Cotton',
      category: 'Fiber',
      quantityKg: 1500,
      remainingKg: 1500,
      unit: 'kg',
      grade: 'GRADE_A',
      perishability: 'LOW',
      shelfLifeHours: 720,
      harvestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      expectedSellingDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      location: 'Amravati, Maharashtra',
      storageAvailable: true,
      passportCode: 'MH-AMR-COT-7782',
      imageUrl: 'https://www.renature.co/wp-content/uploads/2023/07/cotton-1.jpeg',
      status: 'AVAILABLE',
    },
  });

  await prisma.cropPassport.create({
    data: {
      passportCode: 'MH-AMR-COT-7782',
      cropBatchId: cottonBatch.id,
      cropName: 'Cotton',
      farmerName: 'Pranav',
      farmLocation: 'Chandur Railway, Amravati, Maharashtra',
      harvestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      grade: 'GRADE_A (94% AI Quality Score)',
      shelfLifeHours: 720,
      currentOwner: 'Pranav (Origin Farm)',
      destination: 'Direct Agri-Commerce Network',
      provenanceJson: JSON.stringify([
        { stage: 'Crop Sown', date: '2026-06-20', detail: 'Bt Long Staple registered on 5.0 acres Regur Black Cotton soil' },
        { stage: 'AI Quality Verification', date: '2026-09-08', detail: 'Certified Grade A: 94% Quality Score, 31.2mm Staple, 1.8% Trash' },
        { stage: 'Mandi Ready', date: '2026-09-10', detail: 'Estimated batch value ₹1,36,245 (Amravati APMC Modal ₹86.50/kg + 5% Grade A premium)' },
      ]),
    },
  });

  await prisma.marketplaceListing.create({
    data: {
      cropBatchId: cottonBatch.id,
      farmerId: pranavUser.id,
      title: 'Direct Amravati Bt Cotton Long Staple (Grade A)',
      cropName: 'Cotton',
      quantityKg: 1500,
      minOrderQtyKg: 200,
      pricePerKg: 86.5,
      grade: 'GRADE_A',
      location: 'Amravati, Maharashtra',
      isOrganic: false,
      status: 'ACTIVE',
    },
  });

  // Batch 2: Pranav's 20 Quintals (2,000 kg) Soybean Batch
  const soybeanBatch = await prisma.cropBatch.create({
    data: {
      farmerId: pranavUser.id,
      farmId: pranavFarm.id,
      cropName: 'Soybean',
      category: 'Oilseed',
      quantityKg: 2000,
      remainingKg: 2000,
      unit: 'kg',
      grade: 'GRADE_A',
      perishability: 'LOW',
      shelfLifeHours: 720,
      harvestDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      expectedSellingDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      location: 'Amravati, Maharashtra',
      storageAvailable: true,
      passportCode: 'MH-AMR-SOY-8841',
      imageUrl: 'https://www.news-medical.net/images/news/ImageForNews_745986_16823072833517897.jpg',
      status: 'AVAILABLE',
    },
  });

  await prisma.cropPassport.create({
    data: {
      passportCode: 'MH-AMR-SOY-8841',
      cropBatchId: soybeanBatch.id,
      cropName: 'Soybean',
      farmerName: 'Pranav',
      farmLocation: 'Chandur Railway, Amravati, Maharashtra',
      harvestDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      grade: 'GRADE_A (92% AI Quality Score)',
      shelfLifeHours: 720,
      currentOwner: 'Pranav (Origin Farm)',
      destination: 'Direct Agri-Commerce Network',
      provenanceJson: JSON.stringify([
        { stage: 'Crop Sown', date: '2026-06-25', detail: 'Yellow Soybean JS-335 on Regur Black Soil' },
        { stage: 'AI Quality Verification', date: '2026-09-06', detail: 'Grade A: 92% Quality Score, 19.5% Oil Content, 98% Grain Uniformity' },
        { stage: 'Mandi Ready', date: '2026-09-09', detail: 'Estimated batch value ₹97,000 (Amravati APMC Modal ₹48.50/kg)' },
      ]),
    },
  });

  await prisma.marketplaceListing.create({
    data: {
      cropBatchId: soybeanBatch.id,
      farmerId: pranavUser.id,
      title: 'Premium Yellow Soybean JS-335 (Grade A)',
      cropName: 'Soybean',
      quantityKg: 2000,
      minOrderQtyKg: 500,
      pricePerKg: 48.5,
      grade: 'GRADE_A',
      location: 'Amravati, Maharashtra',
      isOrganic: false,
      status: 'ACTIVE',
    },
  });

  // Seed sample crop plan for Pranav
  await prisma.cropPlan.create({
    data: {
      farmerId: pranavUser.id,
      farmId: pranavFarm.id,
      cropName: 'Cotton',
      hindiName: 'कपास',
      marathiName: 'कापूस',
      season: 'KHARIF',
      plannedAcres: 5.0,
      expectedYieldQuintals: 57.5,
      expectedGrossRevenue: 448500.0,
      projectedNetProfit: 298500.0,
      status: 'PLANNED',
      sowingWindow: 'June 15 – July 10 (Onset of Vidarbha Monsoon)',
      notes: 'Recommended Bt Cotton Long Staple for 5.0 acres of Regur Black Cotton Soil with Drip Irrigation.',
    },
  });

  // 5. Seed Remaining 119 Farmers (fam2 to fam120)
  console.log('🌾 Seeding 119 Farmers (fam2–fam120)...');
  const createdFarmers: Record<string, any> = { fam1: pranavUser };

  for (let i = 1; i < MAHARASHTRA_FARMERS.length; i++) {
    const f = MAHARASHTRA_FARMERS[i];
    const userRec = await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        password: farmerHashedPassword,
        mobile: f.phone,
        role: 'FARMER',
        location: `${f.village}, ${f.district}`,
        farmerProfile: {
          create: {
            farmLocation: `${f.village}, ${f.district}`,
            farmSizeAcres: f.landAcres,
            preferredCrops: `${f.primaryCrop}, ${f.secondaryCrop}`,
            trustScore: f.trustScore,
            fulfillmentRate: 96.0,
            totalEarnings: Math.round(f.landAcres * 42000.0),
          },
        },
      },
    });

    createdFarmers[f.id] = userRec;

    const farmRec = await prisma.farm.create({
      data: {
        farmerId: userRec.id,
        farmName: `${f.name}'s Farm`,
        location: `${f.village}, ${f.district}`,
        district: f.district,
        state: 'Maharashtra',
        sizeAcres: f.landAcres,
        soilType: f.soilType,
        irrigationType: 'DRIP_MICRO_IRRIGATION',
      },
    });

    const qty = Math.round(f.landAcres * 600);
    const batch = await prisma.cropBatch.create({
      data: {
        farmerId: userRec.id,
        farmId: farmRec.id,
        cropName: f.primaryCrop,
        category: ['Wheat', 'Soybean', 'Cotton', 'Chickpea'].includes(f.primaryCrop) ? 'Grain/Fiber' : 'Vegetable/Fruit',
        quantityKg: qty,
        remainingKg: qty,
        unit: 'kg',
        grade: f.trustScore >= 90 ? 'GRADE_A' : 'GRADE_B',
        perishability: ['Cotton', 'Soybean', 'Wheat', 'Chickpea', 'Onion'].includes(f.primaryCrop) ? 'LOW' : 'HIGH',
        shelfLifeHours: ['Cotton', 'Soybean', 'Wheat', 'Chickpea', 'Onion'].includes(f.primaryCrop) ? 720 : 72,
        harvestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        expectedSellingDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        location: `${f.village}, ${f.district}`,
        storageAvailable: true,
        passportCode: `MH-${f.district.substring(0, 3).toUpperCase()}-${f.primaryCrop.substring(0, 3).toUpperCase()}-${f.id.toUpperCase()}`,
        imageUrl:
          f.primaryCrop === 'Cotton'
            ? 'https://www.renature.co/wp-content/uploads/2023/07/cotton-1.jpeg'
            : f.primaryCrop === 'Soybean'
            ? 'https://www.news-medical.net/images/news/ImageForNews_745986_16823072833517897.jpg'
            : f.primaryCrop === 'Wheat'
            ? 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'
            : f.primaryCrop === 'Tomato'
            ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
            : f.primaryCrop === 'Onion'
            ? 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80'
            : f.primaryCrop === 'Grapes'
            ? 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80'
            : f.primaryCrop === 'Orange'
            ? 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
      },
    });

    await prisma.cropPassport.create({
      data: {
        passportCode: `MH-${f.district.substring(0, 3).toUpperCase()}-${f.primaryCrop.substring(0, 3).toUpperCase()}-${f.id.toUpperCase()}`,
        cropBatchId: batch.id,
        cropName: f.primaryCrop,
        farmerName: f.name,
        farmLocation: `${f.village}, ${f.district}`,
        harvestDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        grade: `${f.trustScore >= 90 ? 'GRADE_A' : 'GRADE_B'} (Inspected)`,
        shelfLifeHours: ['Cotton', 'Soybean', 'Wheat', 'Chickpea', 'Onion'].includes(f.primaryCrop) ? 720 : 72,
        currentOwner: `${f.name} (Origin Farm)`,
        destination: 'Direct Agri-Commerce Network',
        provenanceJson: JSON.stringify([
          { stage: 'Crop Registered', date: '2026-09-08', detail: `Registered ${qty} kg ${f.primaryCrop} on Farm2Market` },
          { stage: 'Quality Grade', date: '2026-09-09', detail: `Graded ${f.trustScore >= 90 ? 'GRADE_A' : 'GRADE_B'} (${f.trustScore}% Score)` },
        ]),
      },
    });

    const priceMap: Record<string, number> = {
      Cotton: 86.5,
      Soybean: 48.5,
      Wheat: 31.0,
      Tomato: 28.0,
      Onion: 34.0,
      Grapes: 78.0,
      Orange: 48.0,
      Banana: 24.0,
      Sugarcane: 3.4,
      Chickpea: 61.0,
    };

    await prisma.marketplaceListing.create({
      data: {
        cropBatchId: batch.id,
        farmerId: userRec.id,
        title: `${f.name}'s Fresh ${f.primaryCrop} (${f.village})`,
        cropName: f.primaryCrop,
        quantityKg: qty,
        minOrderQtyKg: 100,
        pricePerKg: priceMap[f.primaryCrop] || 30.0,
        grade: f.trustScore >= 90 ? 'GRADE_A' : 'GRADE_B',
        location: `${f.village}, ${f.district}`,
        status: 'ACTIVE',
      },
    });
  }

  // 6. Seed 10 Buyers (byer1 to byer10)
  console.log('🏢 Seeding 10 Buyers (byer1–byer10)...');
  const createdBuyers: Record<string, any> = {};
  for (const b of MAHARASHTRA_BUYERS) {
    const buyerRec = await prisma.user.create({
      data: {
        name: b.contactPerson,
        email: b.email,
        password: buyerHashedPassword,
        mobile: b.phone,
        role: 'BUYER',
        location: `${b.location}, Maharashtra`,
        buyerProfile: {
          create: {
            businessName: b.businessName,
            buyerType: b.buyerType,
            location: `${b.location}, Maharashtra`,
            trustScore: Math.round(b.rating * 20),
            paymentScore: 98.0,
          },
        },
      },
    });

    createdBuyers[b.id] = buyerRec;

    await prisma.buyerRequirement.create({
      data: {
        buyerId: buyerRec.id,
        cropName: b.requirementCrop,
        quantityKg: Math.round(b.volumeKgPerMonth / 4),
        fulfilledKg: 0,
        grade: 'GRADE_A',
        location: `${b.location}, Maharashtra`,
        requiredByDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        budgetPricePerKg: b.budgetPerKg,
        isBulk: b.volumeKgPerMonth >= 20000,
        status: 'OPEN',
        notes: `Regular scheduled procurement for ${b.businessName}. Priority to direct verified farmers.`,
      },
    });
  }

  // 7. Seed 6 FPOs (fpo1 to fpo6)
  console.log('📦 Seeding 6 FPOs (fpo1–fpo6)...');
  for (const fpo of MAHARASHTRA_FPOS) {
    const fpoUser = await prisma.user.create({
      data: {
        name: fpo.name,
        email: fpo.email,
        password: fpoHashedPassword,
        mobile: fpo.phone.replace(/[^0-9]/g, '').slice(-10) || '9822000000',
        role: 'FPO',
        location: `${fpo.location}, Maharashtra`,
        fpoProfile: {
          create: {
            fpoName: fpo.name,
            location: `${fpo.location}, Maharashtra`,
            memberCount: fpo.memberFarmers,
            trustScore: 95,
            registeredSince: '2021',
          },
        },
      },
    });

    const fpoProf = await prisma.fPOProfile.findUnique({ where: { userId: fpoUser.id } });
    if (fpoProf) {
      await prisma.fPOMember.create({
        data: {
          fpoId: fpoProf.id,
          name: fpo.contactPerson,
          location: fpo.location,
          crop: fpo.primaryCrops.split(',')[0].trim(),
          quantityKg: 5000,
          landAcres: 5.0,
        },
      });
    }
  }

  // 8. Seed 4 Admins (admin1 to admin4)
  console.log('🏛️ Seeding 4 Admins (admin1–admin4)...');
  for (const adm of MAHARASHTRA_ADMINS) {
    await prisma.user.create({
      data: {
        name: adm.name,
        email: adm.email,
        password: adminHashedPassword,
        mobile: adm.phone.replace(/[^0-9]/g, '').slice(-10) || '9811000000',
        role: 'ADMIN',
        location: adm.regionScope,
        adminProfile: {
          create: {
            roleTitle: adm.roleTitle,
            department: adm.department,
            regionScope: adm.regionScope,
          },
        },
      },
    });
  }

  // 9. Active Workflows:
  // (A) Buyer byer1 (Rohit Agarwal, Amravati/Nagpur) -> Pranav Cotton Offer -> Order -> Shipment
  console.log('🤝 Seeding Active Cotton Order between Buyer byer1 and Pranav...');
  const buyer1 = createdBuyers['byer1'];
  if (buyer1) {
    const offer = await prisma.offer.create({
      data: {
        cropBatchId: cottonBatch.id,
        senderId: buyer1.id,
        receiverId: pranavUser.id,
        offeredPricePerKg: 87.0, // Favorable offer above modal price
        quantityKg: 1000,
        status: 'ACCEPTED',
        notes: 'Procurement order for Maharashtra Agro Traders spinning facility in Nagpur. Fast settlement.',
      },
    });

    await prisma.negotiation.create({
      data: {
        offerId: offer.id,
        senderId: buyer1.id,
        proposedPricePerKg: 87.0,
        suggestedCounterPrice: 87.0,
        floorPricePerKg: 86.5,
        rationale: 'Fair Price Engine: Offer is 1.5% above Amravati APMC modal price (₹86.50/kg). Recommended for farmer acceptance.',
        action: 'ACCEPTED',
      },
    });

    const order = await prisma.order.create({
      data: {
        buyerId: buyer1.id,
        farmerId: pranavUser.id,
        cropBatchId: cottonBatch.id,
        cropName: 'Cotton',
        quantityKg: 1000,
        pricePerKg: 87.0,
        totalAmount: 87000.0,
        status: 'IN_TRANSIT',
        deliveryAddress: 'Nagpur Industrial Area, Wardha Road, Nagpur, Maharashtra',
        estimatedDeliveryDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        paymentStatus: 'ESCROW_HOLD',
        escrowAmount: 87000.0,
      },
    });

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingCode: 'TRK-COT-AMR-NGP-9021',
        originLocation: 'Amravati, Maharashtra (Pranav Farm)',
        destinationLocation: 'Nagpur Spinning Hub (Maharashtra Agro Traders)',
        vehicleNumber: 'MH-27-AL-7819',
        driverName: 'Sanjay Deshmukh',
        driverPhone: '+91 98220 12345',
        currentStage: 'TRANSPORT',
        progressPercent: 65,
        isConsolidated: false,
        truckCapacityKg: 5000,
        truckUtilizedKg: 1000,
        currentLat: 21.05,
        currentLng: 78.45,
      },
    });

    await prisma.transaction.create({
      data: {
        orderId: order.id,
        cropName: 'Cotton',
        quantityKg: 1000,
        consumerPricePerKg: 95.0,
        farmerPricePerKg: 87.0,
        transportCostPerKg: 2.0,
        storageCostPerKg: 0.5,
        processingCostPerKg: 2.5,
        retailCostPerKg: 2.0,
        platformFeePerKg: 1.0,
        farmerSharePercent: 91.5,
        consumerSavingsPercent: 12.0,
        intermediariesEliminated: 3,
      },
    });

    await prisma.notification.create({
      data: {
        userId: pranavUser.id,
        title: 'Shipment En Route: ₹87,000 Cotton Consignment',
        message: 'Truck MH-27-AL-7819 is 65% through the route to Nagpur. Escrow of ₹87,000 is securely held.',
        category: 'LOGISTICS',
        actionUrl: '/logistics',
      },
    });
  }

  // (B) Buyer byer6 (Apex Oilseeds, Akola) -> Pending Offer on Pranav's Soybean
  console.log('🤝 Seeding Pending Soybean Offer from Buyer byer6 to Pranav...');
  const buyer6 = createdBuyers['byer6'];
  if (buyer6) {
    const soyOffer = await prisma.offer.create({
      data: {
        cropBatchId: soybeanBatch.id,
        senderId: buyer6.id,
        receiverId: pranavUser.id,
        offeredPricePerKg: 49.0, // Above modal price ₹48.5
        quantityKg: 1500,
        status: 'PENDING',
        notes: 'Bulk solvent extraction batch requirement for MIDC Phase II Akola facility. Immediate bank payment upon weighment.',
      },
    });

    await prisma.negotiation.create({
      data: {
        offerId: soyOffer.id,
        senderId: buyer6.id,
        proposedPricePerKg: 49.0,
        suggestedCounterPrice: 49.5,
        floorPricePerKg: 48.5,
        rationale: 'Fair Price Engine: Offer is ₹49.0/kg vs Amravati APMC Modal ₹48.5/kg. Fair price target is ₹49.5/kg.',
        action: 'INITIAL_OFFER',
      },
    });

    await prisma.notification.create({
      data: {
        userId: pranavUser.id,
        title: 'New Offer Received: ₹49.0/kg for 1,500 kg Soybean',
        message: 'Apex Oilseeds (Akola) submitted an offer. Fair Price Engine rates this FAIR PRICE ✅.',
        category: 'OFFERS',
        actionUrl: `/negotiations/${soyOffer.id}`,
      },
    });
  }

  console.log('✅ Database seeded successfully with 120 Farmers, 10 Buyers, 6 FPOs, and 4 Admins!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
