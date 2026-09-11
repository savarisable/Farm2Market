import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getOrders(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    let where: any = {};
    if (role === 'FARMER') where = { farmerId: userId };
    else if (role === 'BUYER' || role === 'CONSUMER') where = { buyerId: userId };
    // Admin sees all

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, location: true, buyerProfile: true } },
        farmer: { select: { id: true, name: true, location: true, farmerProfile: true } },
        shipment: true,
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, location: true, mobile: true, buyerProfile: true } },
        farmer: { select: { id: true, name: true, location: true, mobile: true, farmerProfile: true } },
        cropBatch: { include: { passport: true } },
        shipment: true,
        transaction: true,
      },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, shipmentStage } = req.body;

    const validStatuses = [
      'OFFER',
      'ACCEPTED',
      'PAYMENT_SECURED',
      'PREPARING',
      'PICKED_UP',
      'IN_TRANSIT',
      'QUALITY_CHECK',
      'DELIVERED',
      'PAYMENT_RELEASED',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    const currentOrder = await prisma.order.findUnique({ where: { id }, include: { shipment: true } });
    if (!currentOrder) return res.status(404).json({ success: false, message: 'Order not found.' });

    let paymentStatus = currentOrder.paymentStatus;
    if (status === 'PAYMENT_RELEASED' || status === 'COMPLETED') {
      paymentStatus = 'RELEASED';

      // Update farmer earnings
      await prisma.farmerProfile.updateMany({
        where: { userId: currentOrder.farmerId },
        data: {
          totalEarnings: { increment: currentOrder.totalAmount },
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus,
      },
      include: { shipment: true, buyer: true, farmer: true },
    });

    // Update associated shipment stage if present
    if (currentOrder.shipment) {
      let stage = shipmentStage || currentOrder.shipment.currentStage;
      let progress = currentOrder.shipment.progressPercent;

      if (status === 'PREPARING') {
        stage = 'FARM';
        progress = 25;
      } else if (status === 'PICKED_UP') {
        stage = 'COLLECTION';
        progress = 45;
      } else if (status === 'IN_TRANSIT') {
        stage = 'TRANSPORT';
        progress = 70;
      } else if (status === 'QUALITY_CHECK') {
        stage = 'QUALITY_CHECK';
        progress = 85;
      } else if (status === 'DELIVERED' || status === 'PAYMENT_RELEASED' || status === 'COMPLETED') {
        stage = 'BUYER';
        progress = 100;
      }

      await prisma.shipment.update({
        where: { id: currentOrder.shipment.id },
        data: { currentStage: stage, progressPercent: progress },
      });
    }

    // Send status update notification
    await prisma.notification.create({
      data: {
        userId: currentOrder.farmerId,
        title: `Order Status Updated: ${status} 📦`,
        message: `Order #${id.substring(0, 8)} transitioned to ${status}.`,
        category: 'ORDERS',
        actionUrl: `/orders/${id}`,
      },
    });

    return res.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
