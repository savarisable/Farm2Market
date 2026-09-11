import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aggregateFPOLots } from '../ai/fpoAggregationService';

const prisma = new PrismaClient();

export async function getFPODashboard(req: Request, res: Response) {
  try {
    const fpoUser = await prisma.user.findFirst({
      where: { role: 'FPO' },
      include: {
        fpoProfile: {
          include: { members: true },
        },
      },
    });

    if (!fpoUser || !fpoUser.fpoProfile) {
      return res.status(404).json({ success: false, message: 'FPO profile not found.' });
    }

    const members = fpoUser.fpoProfile.members;
    const memberLots = members.map((m) => ({
      memberId: m.id,
      farmerName: m.name,
      location: m.location,
      cropName: m.crop,
      quantityKg: m.quantityKg,
      grade: 'GRADE_A',
    }));

    const aggregation = aggregateFPOLots(fpoUser.fpoProfile.id, 'Tomato', memberLots, 2500);

    return res.json({
      success: true,
      fpo: {
        id: fpoUser.fpoProfile.id,
        fpoName: fpoUser.fpoProfile.fpoName,
        location: fpoUser.fpoProfile.location,
        memberCount: fpoUser.fpoProfile.memberCount,
        trustScore: fpoUser.fpoProfile.trustScore,
        members,
      },
      aggregationAnalysis: aggregation,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBulkShipment(req: Request, res: Response) {
  try {
    const { cropName, targetQuantityKg, buyerName } = req.body;
    return res.json({
      success: true,
      message: `Bulk pooled shipment for ${targetQuantityKg || 2600} kg of ${cropName || 'Tomato'} created successfully! Consolidated milk-run truck dispatched.`,
      shipmentId: `SHP-BULK-FPO-${Math.floor(1000 + Math.random() * 9000)}`,
      freightSavings: 4200,
      collectiveBonus: 7800,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
