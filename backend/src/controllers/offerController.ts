import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateNegotiationAdvice } from '../ai/negotiationService';

const prisma = new PrismaClient();

const BASE_FLOOR_PRICES: Record<string, number> = {
  Cotton: 72.0,
  Soybean: 40.0,
  Wheat: 22.0,
  Tomato: 16.0,
  Onion: 18.0,
  Chickpea: 48.0,
  Grapes: 45.0,
  Banana: 14.0,
  Orange: 28.0,
  Sugarcane: 2.6,
};

async function checkAndAlertPredatoryPricing(
  cropName: string,
  pricePerKg: number,
  quantityKg: number,
  offerId: string,
  senderName: string = 'Buyer'
) {
  const floor = BASE_FLOOR_PRICES[cropName] || 20.0;
  if (pricePerKg < floor) {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `🚨 Predatory Lowball Alert: ${cropName}`,
          message: `Offer of ₹${pricePerKg}/kg for ${quantityKg} kg ${cropName} from ${senderName} is below the fair market floor (₹${floor}/kg). Potential farmer distress risk detected.`,
          category: 'MARKET_ALERT',
          actionUrl: `/negotiations/${offerId}`,
        },
      });
    }
  }
}

export async function createOffer(req: Request, res: Response) {
  try {
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requirementId, cropBatchId, receiverId, offeredPricePerKg, quantityKg, notes } = req.body;

    if (!receiverId || !offeredPricePerKg || !quantityKg) {
      return res.status(400).json({ success: false, message: 'Receiver, price, and quantity are required.' });
    }

    const price = parseFloat(offeredPricePerKg);
    const qty = parseFloat(quantityKg);

    const offer = await prisma.offer.create({
      data: {
        requirementId: requirementId || null,
        cropBatchId: cropBatchId || null,
        senderId,
        receiverId,
        offeredPricePerKg: price,
        quantityKg: qty,
        status: 'PENDING',
        notes,
      },
    });

    // Record initial negotiation step
    await prisma.negotiation.create({
      data: {
        offerId: offer.id,
        senderId,
        proposedPricePerKg: price,
        action: 'INITIAL_OFFER',
        rationale: notes || 'Direct offer submitted on platform.',
      },
    });

    // Determine crop name for notifications & predatory pricing checks
    let cropName = 'Produce';
    if (cropBatchId) {
      const b = await prisma.cropBatch.findUnique({ where: { id: cropBatchId } });
      if (b) cropName = b.cropName;
    } else if (requirementId) {
      const r = await prisma.buyerRequirement.findUnique({ where: { id: requirementId } });
      if (r) cropName = r.cropName;
    }

    // Check for predatory lowball pricing
    await checkAndAlertPredatoryPricing(cropName, price, qty, offer.id, req.user?.name || 'Buyer');

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: 'New Offer Received! 🤝',
        message: `An offer of ₹${price}/kg for ${qty} kg ${cropName} has been submitted. Check Fair Price analysis.`,
        category: 'OFFERS',
        actionUrl: `/negotiations/${offer.id}`,
      },
    });

    return res.status(201).json({ success: true, offer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOffers(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const offers = await prisma.offer.findMany({
      where: userId ? { OR: [{ senderId: userId }, { receiverId: userId }] } : {},
      include: {
        sender: { select: { id: true, name: true, role: true, location: true } },
        receiver: { select: { id: true, name: true, role: true, location: true } },
        cropBatch: true,
        requirement: true,
        negotiations: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, offers });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOfferById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, role: true, location: true } },
        receiver: { select: { id: true, name: true, role: true, location: true } },
        cropBatch: true,
        requirement: true,
        negotiations: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

    const cropName = offer.cropBatch?.cropName || offer.requirement?.cropName || 'Tomato';
    const guidance = generateNegotiationAdvice(
      offer.id,
      cropName,
      offer.offeredPricePerKg,
      offer.quantityKg,
      offer.cropBatch?.grade || 'GRADE_A'
    );

    return res.json({ success: true, offer, aiGuidance: guidance });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitCounterOffer(req: Request, res: Response) {
  try {
    const senderId = req.user?.id;
    const { id } = req.params;
    const { counterPricePerKg, rationale } = req.body;

    if (!counterPricePerKg) {
      return res.status(400).json({ success: false, message: 'Counter price is required.' });
    }

    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

    const price = parseFloat(counterPricePerKg);

    // Update offer
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        offeredPricePerKg: price,
        status: 'COUNTERED',
      },
    });

    // Record negotiation step
    await prisma.negotiation.create({
      data: {
        offerId: id,
        senderId: senderId || offer.receiverId,
        proposedPricePerKg: price,
        suggestedCounterPrice: price,
        rationale: rationale || `Counter-offer proposed based on prevailing mandi wholesale benchmarks.`,
        action: 'COUNTER_OFFER',
      },
    });

    // Notify other party
    const notifyTarget = senderId === offer.senderId ? offer.receiverId : offer.senderId;
    await prisma.notification.create({
      data: {
        userId: notifyTarget,
        title: 'Counter-Offer Received ⚖️',
        message: `New counter price of ₹${price}/kg submitted. Review negotiation thread.`,
        category: 'OFFERS',
        actionUrl: `/negotiations/${id}`,
      },
    });

    // Check if counter price is predatory lowball
    let cropName = 'Produce';
    if (offer.cropBatchId) {
      const b = await prisma.cropBatch.findUnique({ where: { id: offer.cropBatchId } });
      if (b) cropName = b.cropName;
    } else if (offer.requirementId) {
      const r = await prisma.buyerRequirement.findUnique({ where: { id: offer.requirementId } });
      if (r) cropName = r.cropName;
    }
    await checkAndAlertPredatoryPricing(cropName, price, offer.quantityKg, id, req.user?.name || 'Counter-party');

    return res.json({ success: true, offer: updatedOffer });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function acceptOffer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { cropBatch: true, requirement: true, sender: true, receiver: true },
    });

    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });

    // Mark offer as accepted
    await prisma.offer.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    await prisma.negotiation.create({
      data: {
        offerId: id,
        senderId: req.user?.id || offer.receiverId,
        proposedPricePerKg: offer.offeredPricePerKg,
        action: 'ACCEPTED',
        rationale: 'Agreement finalized. Order generated with escrow payment hold.',
      },
    });

    // Create Order in DB!
    const isSenderBuyer = offer.sender.role === 'BUYER';
    const buyerId = isSenderBuyer ? offer.senderId : offer.receiverId;
    const farmerId = isSenderBuyer ? offer.receiverId : offer.senderId;
    const cropName = offer.cropBatch?.cropName || offer.requirement?.cropName || 'Tomato';
    const totalAmount = offer.quantityKg * offer.offeredPricePerKg;

    const order = await prisma.order.create({
      data: {
        buyerId,
        farmerId,
        requirementId: offer.requirementId,
        cropBatchId: offer.cropBatchId,
        cropName,
        quantityKg: offer.quantityKg,
        pricePerKg: offer.offeredPricePerKg,
        totalAmount,
        status: 'PAYMENT_SECURED',
        deliveryAddress: offer.requirement?.location || 'Pune Retail Hub, Sector 4, Gultekdi, Pune',
        estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        paymentStatus: 'ESCROW_HOLD',
        escrowAmount: totalAmount,
      },
    });

    // Create tracking shipment
    const trackingCode = `TRK-MH-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingCode,
        originLocation: offer.cropBatch?.location || 'Nashik, Maharashtra',
        destinationLocation: order.deliveryAddress,
        vehicleNumber: 'MH-15-EG-4482',
        driverName: 'Sanjay Deshmukh',
        driverPhone: '+91 98220 12345',
        currentStage: 'FARM',
        progressPercent: 20,
        isConsolidated: true,
        consolidatedFarmers: `${offer.receiver.name} (${offer.quantityKg} kg), Cluster Lot B (1,200 kg)`,
        savingsAmount: 4200.0,
        truckCapacityKg: 5000,
        truckUtilizedKg: 4700,
        currentLat: 19.997,
        currentLng: 73.789,
      },
    });

    // Create Transparent Transaction Breakdown
    const consumerPricePerKg = Math.round((offer.offeredPricePerKg * 1.35) * 10) / 10;
    const transportCost = 3.0;
    const storageCost = 1.5;
    const processingCost = 1.5;
    const platformFee = 1.0;
    const retailMargin = Math.round((consumerPricePerKg - offer.offeredPricePerKg - transportCost - storageCost - processingCost - platformFee) * 10) / 10;
    const farmerSharePercent = Math.round((offer.offeredPricePerKg / consumerPricePerKg) * 1000) / 10;

    await prisma.transaction.create({
      data: {
        orderId: order.id,
        cropName,
        quantityKg: offer.quantityKg,
        consumerPricePerKg,
        farmerPricePerKg: offer.offeredPricePerKg,
        transportCostPerKg: transportCost,
        storageCostPerKg: storageCost,
        processingCostPerKg: processingCost,
        retailCostPerKg: Math.max(1.0, retailMargin),
        platformFeePerKg: platformFee,
        farmerSharePercent,
        consumerSavingsPercent: 18.5,
        intermediariesEliminated: 3,
      },
    });

    // Send notifications to both
    await prisma.notification.create({
      data: {
        userId: farmerId,
        title: 'Order Confirmed & Escrow Secured! 🎉',
        message: `Order #${order.id.substring(0, 8)} confirmed at ₹${offer.offeredPricePerKg}/kg. ₹${totalAmount.toLocaleString()} held safely in escrow.`,
        category: 'ORDERS',
        actionUrl: `/orders/${order.id}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: buyerId,
        title: 'Order Dispatched to Fulfillment',
        message: `Farmer accepted trade at ₹${offer.offeredPricePerKg}/kg. Smart Milk-Run pickup scheduled.`,
        category: 'ORDERS',
        actionUrl: `/orders/${order.id}`,
      },
    });

    return res.json({ success: true, message: 'Offer accepted and Order generated successfully!', orderId: order.id });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
