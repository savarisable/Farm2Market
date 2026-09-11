import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { optimizeLogisticsRoute } from '../ai/logisticsOptimizationService';

const prisma = new PrismaClient();

export async function getLogisticsOverview(req: Request, res: Response) {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        order: {
          include: {
            buyer: { select: { name: true, location: true } },
            farmer: { select: { name: true, location: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const routeOptimization = optimizeLogisticsRoute();

    return res.json({
      success: true,
      shipments,
      consolidatedCorridor: routeOptimization,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateShipmentProgress(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { stage, progressPercent, notes } = req.body;

    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        currentStage: stage,
        progressPercent: progressPercent !== undefined ? parseInt(progressPercent) : undefined,
      },
      include: { order: true },
    });

    return res.json({ success: true, shipment });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
