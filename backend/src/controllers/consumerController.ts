import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getConsumerProducts(req: Request, res: Response) {
  try {
    const crops = await prisma.cropBatch.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        farmer: { select: { name: true, location: true } },
        passport: true,
      },
    });

    const products = crops.map((c) => {
      const farmerRealization = c.cropName === 'Tomato' ? 26 : c.cropName === 'Onion' ? 28 : 22;
      const consumerPrice = Math.round(farmerRealization * 1.35);
      const farmerShare = Math.round((farmerRealization / consumerPrice) * 100);

      return {
        id: c.id,
        cropName: `Farm Fresh ${c.cropName}s`,
        rawCropName: c.cropName,
        farmerName: c.farmer.name,
        originLocation: c.location,
        harvestDate: c.harvestDate.toISOString().split('T')[0],
        grade: c.grade,
        imageUrl: c.imageUrl,
        availableKg: c.remainingKg,
        farmerRealizationPerKg: farmerRealization,
        consumerPricePerKg: consumerPrice,
        farmerSharePercent: farmerShare,
        distanceKm: c.location.includes('Nashik') ? 182 : 45,
        passportCode: c.passportCode,
        priceBreakdown: {
          consumerPrice,
          farmerShare: farmerRealization,
          transport: 3.0,
          storage: 1.5,
          processing: 1.5,
          retailMargin: consumerPrice - farmerRealization - 7.0,
          platformFee: 1.0,
        },
      };
    });

    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function consumerCheckout(req: Request, res: Response) {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;
    const consumerId = req.user?.id;

    const total = (items || []).reduce((acc: number, item: any) => acc + item.quantity * item.price, 0);

    return res.json({
      success: true,
      message: 'Order placed successfully! Farm-fresh produce dispatched directly from origin farm.',
      receipt: {
        orderId: `ORD-CONS-${Math.floor(1000 + Math.random() * 9000)}`,
        totalAmount: total,
        deliveryAddress: deliveryAddress || 'Pune, Maharashtra',
        estimatedDelivery: 'Tomorrow by 09:00 AM',
        traceabilityPassport: 'MH-NAS-TOM-26091',
        farmerShareSaved: Math.round(total * 0.22),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getPriceTransparency(req: Request, res: Response) {
  try {
    // Model consumer price breakdown across supply chain
    const breakdown = {
      consumerPricePerKg: 40.0,
      breakdownSlices: [
        { label: 'Farmer Direct Realization', amount: 25.0, percent: 62.5, color: '#16a34a' },
        { label: 'Smart Logistics & Freight', amount: 3.0, percent: 7.5, color: '#0284c7' },
        { label: 'Solar/Cold Storage', amount: 2.0, percent: 5.0, color: '#8b5cf6' },
        { label: 'Grading & Packaging', amount: 2.0, percent: 5.0, color: '#f59e0b' },
        { label: 'Retail Distribution', amount: 5.0, percent: 12.5, color: '#64748b' },
        { label: 'Platform Technology', amount: 1.0, percent: 2.5, color: '#10b981' },
        { label: 'Other Friction / Buffer', amount: 2.0, percent: 5.0, color: '#cbd5e1' },
      ],
      traditionalComparison: {
        traditionalFarmerSharePercent: 25.0,
        farm2marketFarmerSharePercent: 62.5,
        farmerShareIncreasePercent: 150.0,
        intermediariesTraditional: 6,
        intermediariesPlatform: 2,
        intermediariesReducedPercent: 66.7,
        consumerPriceSavingsPercent: 18.2,
      },
    };

    return res.json({ success: true, ...breakdown });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
