import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getMarkets(req: Request, res: Response) {
  try {
    const markets = await prisma.market.findMany({
      include: {
        region: true,
        prices: { orderBy: { date: 'desc' } },
      },
    });
    return res.json({ success: true, markets });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRegions(req: Request, res: Response) {
  try {
    const regions = await prisma.region.findMany({
      include: {
        markets: { include: { prices: true } },
        forecasts: true,
      },
    });
    return res.json({ success: true, regions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMarketPrices(req: Request, res: Response) {
  try {
    const { crop } = req.query;
    const where = crop ? { cropName: crop as string } : {};
    const prices = await prisma.marketPrice.findMany({
      where,
      include: { market: { include: { region: true } } },
      orderBy: { date: 'desc' },
    });
    return res.json({ success: true, prices });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
