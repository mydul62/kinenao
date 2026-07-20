import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError } from "../../app/errors/AppError";

export const previewCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { items, deliveryZoneId, couponCode } = req.body;

    // 1. Fetch delivery zone
    const zone = await prisma.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
    if (!zone) {
      throw new BadRequestError("Invalid delivery zone");
    }

    let deliveryCharge = zone.charge;

    // 2. Validate products and calculate totals
    let itemsSubtotal = 0;
    const checkoutItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          discountPrice: true,
          stockQty: true,
          reservedStockQty: true,
          thumbnail: true,
          isActive: true,
        },
      });

      if (!product || !product.isActive) {
        throw new NotFoundError(`Product with ID "${item.productId}" not found or inactive`);
      }

      const availableStock = product.stockQty - product.reservedStockQty;
      const hasStock = availableStock >= item.quantity;

      const purchasePrice =
        product.discountPrice !== null ? product.discountPrice : product.price;
      const lineTotal = purchasePrice * item.quantity;
      itemsSubtotal += lineTotal;

      checkoutItems.push({
        productId: product.id,
        name: product.name,
        thumbnail: product.thumbnail,
        quantity: item.quantity,
        price: product.price,
        discountPrice: product.discountPrice,
        purchasePrice,
        lineTotal,
        hasStock,
        availableStock,
      });
    }

    // 3. Process coupon if provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon || !coupon.isActive) {
        throw new BadRequestError("Coupon is invalid or inactive");
      }
      if (new Date() > coupon.expiresAt) {
        throw new BadRequestError("Coupon has expired");
      }
      if (coupon.usageCount >= coupon.usageLimit) {
        throw new BadRequestError("Coupon usage limit reached");
      }
      if (itemsSubtotal < coupon.minPurchase) {
        throw new BadRequestError(
          `Minimum purchase of ৳${coupon.minPurchase} is required to apply this coupon`
        );
      }

      if (coupon.type === "FIXED") {
        discountAmount = coupon.value;
      } else if (coupon.type === "PERCENTAGE") {
        discountAmount = (itemsSubtotal * coupon.value) / 100;
      } else if (coupon.type === "FREE_DELIVERY") {
        deliveryCharge = 0;
      }

      couponApplied = {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      };
    }

    const grandTotal = Math.max(0, itemsSubtotal + deliveryCharge - discountAmount);

    res.status(200).json({
      status: "success",
      data: {
        items: checkoutItems,
        summary: {
          itemsSubtotal,
          deliveryCharge,
          discountAmount,
          grandTotal,
        },
        couponApplied,
        deliveryZone: {
          zoneName: zone.zoneName,
          estDeliveryTime: zone.estDeliveryTime,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
