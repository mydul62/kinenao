import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

export const createDeliveryZone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { zoneName, charge, estDeliveryTime } = req.body;

    const existing = await prisma.deliveryZone.findUnique({ where: { zoneName } });
    if (existing) {
      throw new BadRequestError(`Delivery zone "${zoneName}" already exists`);
    }

    const deliveryZone = await prisma.deliveryZone.create({
      data: {
        zoneName,
        charge,
        estDeliveryTime,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        deliveryZone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryZones = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const zones = await prisma.deliveryZone.findMany({
      orderBy: { zoneName: "asc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        deliveryZones: zones,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryZoneById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const zone = await prisma.deliveryZone.findUnique({ where: { id } });

    if (!zone) {
      throw new NotFoundError("Delivery zone not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        deliveryZone: zone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryZone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { zoneName, charge, estDeliveryTime } = req.body;

    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundError("Delivery zone not found");
    }

    const data: any = {};
    if (zoneName) {
      const existing = await prisma.deliveryZone.findFirst({
        where: { zoneName, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestError(`Delivery zone "${zoneName}" already exists`);
      }
      data.zoneName = zoneName;
    }
    if (charge !== undefined) data.charge = charge;
    if (estDeliveryTime !== undefined) data.estDeliveryTime = estDeliveryTime;

    const updatedZone = await prisma.deliveryZone.update({
      where: { id },
      data,
    });

    res.status(200).json({
      status: "success",
      data: {
        deliveryZone: updatedZone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDeliveryZone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;

    const zone = await prisma.deliveryZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundError("Delivery zone not found");
    }

    const hasOrders = await prisma.order.findFirst({ where: { deliveryZoneId: id } });
    if (hasOrders) {
      throw new BadRequestError("Cannot delete delivery zone as it is referenced in orders");
    }

    await prisma.deliveryZone.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Delivery zone deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
