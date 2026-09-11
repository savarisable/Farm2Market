import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  CropRecommendationEngine,
  CropRecommendationInput,
} from '../services/cropRecommendationEngine';
import {
  INDIA_LOCATIONS_HIERARCHY,
  INDIA_SOIL_PROFILES,
  CROP_AGRONOMY_DATABASE,
} from '../data/crops/indiaAgriData';
import { SerpApiService } from '../services/serpApiService';
import { callGeminiChat } from '../ai/geminiService';

const prisma = new PrismaClient();


/**
 * Returns administrative hierarchy (State -> District -> Taluka)
 */
export async function getLocationsHierarchy(req: Request, res: Response) {
  try {
    const states = INDIA_LOCATIONS_HIERARCHY.map((s) => ({
      stateName: s.stateName,
      stateCode: s.stateCode,
      districts: s.districts.map((d) => ({
        districtName: d.districtName,
        talukas: d.talukas,
        dominantSoil: d.dominantSoil,
        annualRainfallMm: d.annualRainfallMm,
        avgTempRange: d.avgTempRange,
        irrigationCoveragePercent: d.irrigationCoveragePercent,
      })),
    }));

    return res.json({
      success: true,
      states,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Returns available soil types and characteristics
 */
export async function getSoilProfiles(req: Request, res: Response) {
  try {
    return res.json({
      success: true,
      soilTypes: Object.values(INDIA_SOIL_PROFILES),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Main Deterministic Land Analysis & Crop Recommendation Endpoint
 */
export async function analyzeCropSuitability(req: Request, res: Response) {
  try {
    const {
      state = 'Maharashtra',
      district = 'Nashik',
      taluka = 'Niphad',
      farmAreaAcres = 4.0,
      soilType = 'Black Cotton Soil',
      irrigationType = 'DRIP_MICRO_IRRIGATION',
      season = 'KHARIF',
      soilChemistry,
    } = req.body;

    const input: CropRecommendationInput = {
      state,
      district,
      taluka,
      farmAreaAcres: parseFloat(farmAreaAcres) || 4.0,
      soilType,
      irrigationType,
      season,
      soilChemistry: soilChemistry
        ? {
            ph: soilChemistry.ph ? parseFloat(soilChemistry.ph) : undefined,
            nitrogenKgPerHa: soilChemistry.nitrogenKgPerHa ? parseFloat(soilChemistry.nitrogenKgPerHa) : undefined,
            phosphorusKgPerHa: soilChemistry.phosphorusKgPerHa ? parseFloat(soilChemistry.phosphorusKgPerHa) : undefined,
            potassiumKgPerHa: soilChemistry.potassiumKgPerHa ? parseFloat(soilChemistry.potassiumKgPerHa) : undefined,
          }
        : undefined,
    };

    // 1. Run deterministic numerical scoring engine
    const analysis = CropRecommendationEngine.analyzeLand(input);

    // 2. Query nearby agricultural centers (KVKs, Soil Testing Labs) via SerpApi service
    const nearbyServices = await SerpApiService.getNearbyAgriServices(district, 'ALL');

    return res.json({
      success: true,
      ...analysis,
      nearbyAgriServices: nearbyServices,
    });
  } catch (error: any) {
    console.error('analyzeCropSuitability error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Standalone nearby KVK & Soil Testing Lab lookup
 */
export async function getNearbyAgriPlaces(req: Request, res: Response) {
  try {
    const district = (req.query.district as string) || 'Nashik';
    const type = (req.query.type as any) || 'ALL';
    const places = await SerpApiService.getNearbyAgriServices(district, type);
    return res.json({
      success: true,
      district,
      places,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Ask Saarthi AI to explain this recommendation in Marathi / Hindi / English
 */
export async function explainRecommendationWithSaarthi(req: Request, res: Response) {
  try {
    const { topCrop, district, soilType, irrigationType, language = 'mr' } = req.body;

    const langName = language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English';

    const systemPrompt = `You are "Saarthi" (सारथी), the official AI Agriculture & Farmer Advisory Companion for the Government of India Department of Consumer Affairs (DoCA).
A farmer has received a deterministic crop recommendation from our agro-economic engine:
- Recommended Top Crop: ${topCrop}
- District: ${district}, Maharashtra
- Soil Type: ${soilType}
- Irrigation Type: ${irrigationType}

Explain in simple, encouraging, farmer-friendly ${langName} why ${topCrop} is well-suited for their land, key agronomic tips for sowing, irrigation timing, and how selling directly on Farm2Market AI will fetch them fair prices and avoid middleman cuts.
Keep response concise, practical, and structured in 3-4 bullet points. End with an empowering message.`;

    const query = `Please explain why ${topCrop} is recommended for my farm in ${district} with ${soilType} soil in ${langName}.`;
    const explanation = await callGeminiChat(query, language as 'en' | 'hi' | 'mr', systemPrompt);

    return res.json({
      success: true,
      reply: explanation || 'शिफारस केलेले पीक आपल्या माती आणि हवामानासाठी पूर्णपणे योग्य आहे.',
      language,
    });

  } catch (error: any) {
    console.error('explainRecommendationWithSaarthi error:', error);
    return res.status(500).json({
      success: false,
      reply: 'सावधगिरी: सध्या AI सल्लागार ऑफलाइन आहे. शिफारस केलेले पीक आपल्या माती आणि हवामानासाठी पूर्णपणे योग्य आहे.',
    });
  }
}

/**
 * Save selected crop recommendation to farmer's crop_plans table
 */
export async function saveCropPlan(req: Request, res: Response) {
  try {
    const farmerId = req.user?.id;
    if (!farmerId) {
      return res.status(401).json({ success: false, message: 'Authentication required to save crop plan.' });
    }

    const {
      cropName,
      hindiName,
      marathiName,
      season = 'KHARIF',
      plannedAcres = 5.0,
      expectedYieldQuintals = 40.0,
      expectedGrossRevenue = 340000.0,
      projectedNetProfit = 210000.0,
      sowingWindow,
      notes,
    } = req.body;

    // Find farmer's farm if exists
    const farm = await prisma.farm.findFirst({
      where: { farmerId },
    });

    const cropPlan = await prisma.cropPlan.create({
      data: {
        farmerId,
        farmId: farm?.id,
        cropName,
        hindiName,
        marathiName,
        season,
        plannedAcres: parseFloat(plannedAcres) || 5.0,
        expectedYieldQuintals: parseFloat(expectedYieldQuintals) || 0,
        expectedGrossRevenue: parseFloat(expectedGrossRevenue) || 0,
        projectedNetProfit: parseFloat(projectedNetProfit) || 0,
        sowingWindow: sowingWindow || 'Upcoming Season',
        notes: notes || `Planned ${plannedAcres} acres of ${cropName} based on AI land suitability analysis.`,
        status: 'PLANNED',
      },
    });

    // Create persistent notification
    await prisma.notification.create({
      data: {
        userId: farmerId,
        title: `Crop Plan Saved: ${cropName} (${plannedAcres} Acres) 🌾`,
        message: `Your crop cultivation plan for ${cropName} has been saved to your dashboard with estimated gross revenue of ₹${Number(expectedGrossRevenue).toLocaleString('en-IN')}.`,
        category: 'AI',
        actionUrl: '/crop-planning',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Crop plan for ${cropName} saved successfully.`,
      cropPlan,
    });
  } catch (error: any) {
    console.error('saveCropPlan error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get all saved crop plans for the logged-in farmer
 */
export async function getMyCropPlans(req: Request, res: Response) {
  try {
    const farmerId = req.user?.id;
    if (!farmerId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const plans = await prisma.cropPlan.findMany({
      where: { farmerId },
      include: { farm: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      cropPlans: plans,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

