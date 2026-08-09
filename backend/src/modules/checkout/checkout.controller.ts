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

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Items are required for checkout calculation");
    }

    // 1. Fetch delivery zone
    let zone = null;
    if (deliveryZoneId) {
      zone = await prisma.deliveryZone.findFirst({
        where: {
          OR: [{ id: deliveryZoneId }, { zoneName: deliveryZoneId }],
        },
      });
    }
    if (!zone) {
      zone = await prisma.deliveryZone.findFirst();
    }
    if (!zone) {
      throw new BadRequestError("Invalid delivery zone");
    }

    let deliveryCharge = zone.charge;

    // 2. Validate products, variants and calculate totals
    let itemsSubtotal = 0;
    const checkoutItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { slug: item.productId },
            { sku: item.productId },
          ],
        },
        include: {
          variants: true,
        },
      });

      if (!product || !product.isActive) {
        throw new NotFoundError(`Product with ID "${item.productId}" not found or inactive`);
      }

      let variant = null;
      if (item.variantId) {
        variant = product.variants.find(
          (v) => v.id === item.variantId || v.name === item.variantId
        );
      }

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (variant) {
        const availableStock = Math.max(0, variant.stockQty - variant.reservedStockQty);
        const hasStock = variant.stockQty > 0 ? availableStock >= quantity : true;

        const purchasePrice =
          variant.discountPrice !== null && variant.discountPrice !== undefined
            ? variant.discountPrice
            : variant.price !== null && variant.price !== undefined
            ? variant.price
            : product.discountPrice !== null
            ? product.discountPrice
            : product.price;

        const lineTotal = purchasePrice * quantity;
        itemsSubtotal += lineTotal;

        checkoutItems.push({
          productId: product.id,
          name: product.name,
          thumbnail: variant.imageUrl || product.thumbnail || (product.images && product.images[0]),
          variantId: variant.id,
          variantName: variant.name,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          quantity,
          price: variant.price || product.price,
          discountPrice: variant.discountPrice || product.discountPrice,
          purchasePrice,
          lineTotal,
          hasStock,
          availableStock,
        });
      } else {
        const availableStock = Math.max(0, product.stockQty - product.reservedStockQty);
        const hasStock = product.stockQty > 0 ? availableStock >= quantity : true;

        const purchasePrice =
          product.discountPrice !== null ? product.discountPrice : product.price;
        const lineTotal = purchasePrice * quantity;
        itemsSubtotal += lineTotal;

        checkoutItems.push({
          productId: product.id,
          name: product.name,
          thumbnail: product.thumbnail || (product.images && product.images[0]),
          quantity,
          price: product.price,
          discountPrice: product.discountPrice,
          purchasePrice,
          lineTotal,
          hasStock,
          availableStock,
        });
      }
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
          charge: zone.charge,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
