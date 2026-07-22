import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError } from "../../app/errors/AppError";

// ─── GET MY NOTIFICATIONS ─────────────────────────────────────────────────────

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── MARK AS READ ─────────────────────────────────────────────────────────────

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params as any;

    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundError("Notification not found");

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.status(200).json({ status: "success", data: { notification: updated } });
  } catch (error) {
    next(error);
  }
};

// ─── MARK ALL AS READ ────────────────────────────────────────────────────────

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({ status: "success", message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE NOTIFICATION ─────────────────────────────────────────────────────

export const deleteNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params as any;

    const notification = await prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundError("Notification not found");

    await prisma.notification.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

// ─── SEND NOTIFICATION (Admin) ────────────────────────────────────────────────

export const sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, title, message } = req.body;

    const notification = await prisma.notification.create({
      data: { userId, title, message },
    });

    res.status(201).json({ status: "success", data: { notification } });
  } catch (error) {
    next(error);
  }
};
