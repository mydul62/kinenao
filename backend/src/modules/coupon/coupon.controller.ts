import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, type, value, minPurchase, usageLimit, expiresAt, isActive } = req.body;

    const existingCoupon = await prisma.coupon.findUnique({ where: { code } });
    if (existingCoupon) {
      throw new BadRequestError(`Coupon with code "${code}" already exists`);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minPurchase,
        usageLimit,
        expiresAt: new Date(expiresAt),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { expiresAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        coupons,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        coupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { code, type, value, minPurchase, usageLimit, expiresAt, isActive } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    const data: any = {};
    if (code) {
      const existing = await prisma.coupon.findFirst({
        where: { code, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestError(`Coupon with code "${code}" already exists`);
      }
      data.code = code;
    }

    if (type) data.type = type;
    if (value !== undefined) data.value = value;
    if (minPurchase !== undefined) data.minPurchase = minPurchase;
    if (usageLimit !== undefined) data.usageLimit = usageLimit;
    if (expiresAt) data.expiresAt = new Date(expiresAt);
    if (isActive !== undefined) data.isActive = isActive;

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    res.status(200).json({
      status: "success",
      data: {
        coupon: updatedCoupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundError("Coupon not found");
    }

    await prisma.coupon.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, purchaseAmount } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestError("Coupon is invalid or inactive");
    }

    if (new Date() > coupon.expiresAt) {
      throw new BadRequestError("Coupon has expired");
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestError("Coupon usage limit has been reached");
    }

    if (purchaseAmount < coupon.minPurchase) {
      throw new BadRequestError(`Minimum purchase amount of ৳${coupon.minPurchase} is required to apply this coupon`);
    }

    let discountAmount = 0;
    if (coupon.type === "FIXED") {
      discountAmount = coupon.value;
    } else if (coupon.type === "PERCENTAGE") {
      discountAmount = (purchaseAmount * coupon.value) / 100;
    } else if (coupon.type === "FREE_DELIVERY") {
      discountAmount = 0;
    }

    res.status(200).json({
      status: "success",
      message: "Coupon validated successfully",
      data: {
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};
