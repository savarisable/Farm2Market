import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function postRequirement(req: Request, res: Response) {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { cropName, quantityKg, grade, location, requiredByDate, budgetPricePerKg, isBulk, notes } = req.body;

    if (!cropName || !quantityKg || !budgetPricePerKg) {
      return res.status(400).json({ success: false, message: 'Crop name, quantity, and budget price are required.' });
    }

    const requirement = await prisma.buyerRequirement.create({
      data: {
        buyerId,
        cropName,
        quantityKg: parseFloat(quantityKg),
        grade: grade || 'GRADE_A',
        location: location || 'Pune, Maharashtra',
        requiredByDate: requiredByDate ? new Date(requiredByDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        budgetPricePerKg: parseFloat(budgetPricePerKg),
        isBulk: Boolean(isBulk),
        notes,
        status: 'OPEN',
      },
    });

    return res.status(201).json({ success: true, requirement });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRequirements(req: Request, res: Response) {
  try {
    const { crop, isBulk } = req.query;
    const where: any = {};
    if (crop) where.cropName = crop as string;
    if (isBulk !== undefined) where.isBulk = isBulk === 'true';

    const requirements = await prisma.buyerRequirement.findMany({
      where,
      include: { buyer: { select: { id: true, name: true, location: true, buyerProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, requirements });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBulkMarketplace(req: Request, res: Response) {
  try {
    // Bulk orders (e.g. 10,000 kg Potato processing requirement)
    const bulkReqs = await prisma.buyerRequirement.findMany({
      where: { isBulk: true },
      include: { buyer: { include: { buyerProfile: true } } },
    });

    // Simulated FPO / Farmer group pooling fulfillment breakdown
    const bulkOpportunities = bulkReqs.map((req) => ({
      requirementId: req.id,
      buyerName: req.buyer.buyerProfile?.businessName || req.buyer.name,
      cropName: req.cropName,
      requiredQuantityKg: req.quantityKg,
      budgetPricePerKg: req.budgetPricePerKg,
      location: req.location,
      deliveryDate: req.requiredByDate.toISOString().split('T')[0],
      fulfillmentAllocation: [
        { supplierName: 'Sahyadri Agro FPO (Nashik)', suppliedKg: 4000, percentage: 40, status: 'Committed' },
        { supplierName: 'Mahavrudhi Farmers Producer Co. (Pune)', suppliedKg: 3000, percentage: 30, status: 'Committed' },
        { supplierName: 'Kisan Kranti Farmer Cluster (Manchar)', suppliedKg: 3000, percentage: 30, status: 'Ready to Dispatch' },
      ],
      fulfillmentPercentage: 100,
      totalFulfillmentKg: 10000,
      notes: req.notes,
    }));

    return res.json({ success: true, bulkOpportunities });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
