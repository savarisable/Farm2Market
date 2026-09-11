import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const notifications = await prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({ success: true, notifications, unreadCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return res.json({ success: true, notification: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    await prisma.notification.updateMany({
      where: userId ? { userId } : {},
      data: { isRead: true },
    });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteNotification(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    return res.json({ success: true, message: 'Notification deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
