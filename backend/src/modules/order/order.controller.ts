import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../app/errors/AppError";
import { OrderStatus, Role } from "@prisma/client";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      items,
      deliveryAddressId,
      deliveryZoneId,
      couponCode,
      customerNote,
      guestInfo,
      paymentMethodId,
      senderNumber,
      transactionId,
      paymentScreenshotUrl,
    } = req.body;

    const userId = req.user?.id || null;

    if (!userId && !guestInfo) {
      throw new BadRequestError("Customer account or Guest Information is required to place an order");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError("Order items are required");
    }

    // Run atomic Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and validate delivery address if provided
      let validAddressId: string | null = null;
      if (deliveryAddressId) {
        const address = await tx.address.findUnique({
          where: { id: deliveryAddressId },
          include: { profile: true },
        });
        if (address && userId && address.profile.userId === userId) {
          validAddressId = address.id;
        }
      }

      // 2. Fetch and validate delivery zone
      let zone = null;
      if (deliveryZoneId) {
        zone = await tx.deliveryZone.findFirst({
          where: {
            OR: [
              { id: deliveryZoneId },
              { zoneName: deliveryZoneId },
            ],
          },
        });
      }
      if (!zone) {
        zone = await tx.deliveryZone.findFirst();
      }
      if (!zone) {
        throw new BadRequestError("Invalid delivery zone");
      }

      let deliveryCharge = zone.charge;

      // 3. Resolve Payment Method
      let resolvedPaymentMethodId: string | null = null;
      let isCashOnDelivery = false;

      if (paymentMethodId) {
        if (
          paymentMethodId === "COD" ||
          paymentMethodId.toLowerCase() === "cod" ||
          paymentMethodId.toLowerCase().includes("cash")
        ) {
          isCashOnDelivery = true;
          const codMethod = await tx.paymentMethod.findFirst({
            where: {
              OR: [
                { accountType: "COD" },
                { name: { contains: "Cash", mode: "insensitive" } },
                { name: { contains: "ক্যাশ", mode: "insensitive" } },
              ],
            },
          });
          resolvedPaymentMethodId = codMethod?.id || null;
        } else {
          const pm = await tx.paymentMethod.findUnique({ where: { id: paymentMethodId } });
          if (pm) {
            resolvedPaymentMethodId = pm.id;
            if (pm.accountType === "COD" || pm.name.toLowerCase().includes("cash")) {
              isCashOnDelivery = true;
            }
          }
        }
      } else {
        // Default to COD if available
        const codMethod = await tx.paymentMethod.findFirst({
          where: {
            OR: [
              { accountType: "COD" },
              { name: { contains: "Cash", mode: "insensitive" } },
              { name: { contains: "ক্যাশ", mode: "insensitive" } },
            ],
          },
        });
        if (codMethod) {
          resolvedPaymentMethodId = codMethod.id;
          isCashOnDelivery = true;
        }
      }

      // 4. Process products & variants with stock validation
      let itemsSubtotal = 0;
      const orderItemsData: any[] = [];
      const productUpdates: { id: string; reservedStockQty: number }[] = [];
      const variantUpdates: { id: string; reservedStockQty: number }[] = [];

      for (const item of items) {
        let product = await tx.product.findFirst({
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

        // Fallback for re-seeded mock products
        if (!product || !product.isActive) {
          product = await tx.product.findFirst({
            where: { isActive: true },
            include: { variants: true },
          });
        }

        if (!product) {
          continue;
        }

        let variant = null;
        if (item.variantId) {
          variant = product.variants.find((v) => v.id === item.variantId || v.name === item.variantId);
        }

        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

        if (variant) {
          const availableVariantStock = Math.max(0, variant.stockQty - variant.reservedStockQty);
          if (variant.stockQty > 0 && availableVariantStock < quantity) {
            throw new BadRequestError(
              `Insufficient stock for "${product.name} (${variant.name})". Available: ${availableVariantStock}, Requested: ${quantity}`
            );
          }

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

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            productSku: variant.sku || product.sku,
            productImage: variant.imageUrl || product.thumbnail || (product.images && product.images[0]) || null,
            variantId: variant.id,
            variantName: variant.name,
            colorName: variant.colorName || null,
            colorCode: variant.colorCode || null,
            size: variant.size || null,
            quantity,
            price: purchasePrice,
          });

          variantUpdates.push({
            id: variant.id,
            reservedStockQty: variant.reservedStockQty + quantity,
          });

          productUpdates.push({
            id: product.id,
            reservedStockQty: product.reservedStockQty + quantity,
          });
        } else {
          const availableStock = Math.max(0, product.stockQty - product.reservedStockQty);
          if (product.stockQty > 0 && availableStock < quantity) {
            throw new BadRequestError(
              `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${quantity}`
            );
          }

          const purchasePrice =
            product.discountPrice !== null ? product.discountPrice : product.price;
          const lineTotal = purchasePrice * quantity;
          itemsSubtotal += lineTotal;

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            productImage: product.thumbnail || (product.images && product.images[0]) || null,
            quantity,
            price: purchasePrice,
          });

          productUpdates.push({
            id: product.id,
            reservedStockQty: product.reservedStockQty + quantity,
          });
        }
      }

      // 5. Validate Coupon if provided
      let couponId: string | null = null;
      let discountAmount = 0;

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (!coupon || !coupon.isActive) {
          throw new BadRequestError("Coupon is invalid or inactive");
        }
        if (new Date() > coupon.expiresAt) {
          throw new BadRequestError("Coupon has expired");
        }
        if (coupon.usageCount >= coupon.usageLimit) {
          throw new BadRequestError("Coupon usage limit has been reached");
        }
        if (itemsSubtotal < coupon.minPurchase) {
          throw new BadRequestError(
            `Minimum purchase amount of ৳${coupon.minPurchase} is required for this coupon`
          );
        }

        couponId = coupon.id;
        if (coupon.type === "FIXED") {
          discountAmount = coupon.value;
        } else if (coupon.type === "PERCENTAGE") {
          discountAmount = (itemsSubtotal * coupon.value) / 100;
        } else if (coupon.type === "FREE_DELIVERY") {
          deliveryCharge = 0;
        }

        // Increment coupon usage
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: coupon.usageCount + 1 },
        });
      }

      const grandTotal = Math.max(0, itemsSubtotal + deliveryCharge - discountAmount);

      // 6. Update reserved stock quantities
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: { reservedStockQty: update.reservedStockQty },
        });
      }

      for (const vUpdate of variantUpdates) {
        await tx.productVariant.update({
          where: { id: vUpdate.id },
          data: { reservedStockQty: vUpdate.reservedStockQty },
        });
      }

      // 7. Determine initial order status & timeline note
      let initialStatus = OrderStatus.PENDING_PAYMENT;
      let timelineNote = "Order created, waiting for payment.";

      if (isCashOnDelivery) {
        initialStatus = OrderStatus.CONFIRMED;
        timelineNote = "Cash on Delivery order confirmed. Payment will be collected upon delivery.";
      } else if (transactionId || senderNumber) {
        initialStatus = OrderStatus.PENDING_PAYMENT_VERIFICATION;
        timelineNote = `Payment details submitted (TrxID: ${transactionId || "N/A"}). Waiting for admin verification.`;
      }

      // 8. Create Order record
      const order = await tx.order.create({
        data: {
          customerId: userId,
          guestInfo: guestInfo || null,
          status: initialStatus,
          paymentMethodId: resolvedPaymentMethodId,
          senderNumber: senderNumber || null,
          transactionId: transactionId || null,
          paidAmount: grandTotal,
          paymentScreenshotUrl: paymentScreenshotUrl || null,
          deliveryZoneId: zone.id,
          deliveryCharge,
          grandTotal,
          deliveryAddressId: validAddressId,
          couponId,
          customerNote: customerNote || (guestInfo ? guestInfo.orderNotes : null),
          orderItems: {
            create: orderItemsData,
          },
          timelineEvents: {
            create: {
              status: initialStatus,
              note: timelineNote,
            },
          },
        },
        include: {
          orderItems: {
            include: {
              product: { select: { name: true, thumbnail: true } },
              variant: true,
            },
          },
          timelineEvents: true,
          deliveryAddress: true,
          deliveryZone: true,
          paymentMethod: true,
        },
      });

      return order;
    });

    res.status(201).json({
      status: "success",
      message: "Order placed successfully!",
      data: {
        order: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitPaymentProof = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { paymentMethodId, senderNumber, transactionId, paidAmount, paymentScreenshotUrl } = req.body;
    const userId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (userId && order.customerId && order.customerId !== userId) {
      throw new ForbiddenError("You can only submit payment proofs for your own orders");
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentMethodId: paymentMethodId || order.paymentMethodId,
        senderNumber,
        transactionId,
        paidAmount: paidAmount ? parseFloat(paidAmount) : order.grandTotal,
        paymentScreenshotUrl: paymentScreenshotUrl || order.paymentScreenshotUrl,
        status: OrderStatus.PENDING_PAYMENT_VERIFICATION,
        timelineEvents: {
          create: {
            status: OrderStatus.PENDING_PAYMENT_VERIFICATION,
            note: `Payment proof submitted by customer (TrxID: ${transactionId}). Verification pending.`,
          },
        },
      },
      include: {
        paymentMethod: true,
        orderItems: {
          include: { variant: true, product: true },
        },
        timelineEvents: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Payment proof submitted successfully. Order is pending verification.",
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (action === "approve") {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CONFIRMED,
          timelineEvents: {
            create: {
              status: OrderStatus.CONFIRMED,
              note: note || "Manual payment verified and approved by admin.",
            },
          },
        },
        include: { timelineEvents: true },
      });

      res.status(200).json({
        status: "success",
        message: "Payment verified and order confirmed successfully",
        data: { order: updated },
      });
      return;
    }

    if (action === "reject") {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.PENDING_PAYMENT,
          timelineEvents: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: note || "Payment details rejected by admin. Please resubmit valid payment proof.",
            },
          },
        },
        include: { timelineEvents: true },
      });

      res.status(200).json({
        status: "success",
        message: "Payment details rejected. Order status reverted to pending payment.",
        data: { order: updated },
      });
      return;
    }

    throw new BadRequestError("Invalid action. Must be 'approve' or 'reject'");
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = "1", limit = "10" } = req.query as any;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: userId },
        include: {
          orderItems: {
            include: {
              product: { select: { id: true, name: true, thumbnail: true } },
              variant: true,
            },
          },
          timelineEvents: {
            orderBy: { timestamp: "desc" },
          },
          deliveryZone: true,
          paymentMethod: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where: { customerId: userId } }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, thumbnail: true, sku: true } },
            variant: true,
          },
        },
        timelineEvents: {
          orderBy: { timestamp: "asc" },
        },
        deliveryAddress: true,
        deliveryZone: true,
        paymentMethod: true,
        customer: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, phoneNumber: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.MANAGER &&
      order.customerId &&
      order.customerId !== userId
    ) {
      throw new ForbiddenError("You are not authorized to view this order");
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, search, page = "1", limit = "15" } = req.query as any;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { senderNumber: { contains: search, mode: "insensitive" } },
        { transactionId: { contains: search, mode: "insensitive" } },
        {
          customer: {
            profile: {
              fullName: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: { select: { name: true, thumbnail: true, sku: true } },
              variant: true,
            },
          },
          customer: {
            select: {
              email: true,
              profile: { select: { fullName: true, phoneNumber: true } },
            },
          },
          paymentMethod: true,
          deliveryZone: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { status, note } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      throw new BadRequestError("Invalid order status");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If order is transitioning to DELIVERED, increment soldQty and release reserved stock
      if (status === OrderStatus.DELIVERED && order.status !== OrderStatus.DELIVERED) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              soldQty: { increment: item.quantity },
              stockQty: { decrement: item.quantity },
              reservedStockQty: { decrement: item.quantity },
            },
          });

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQty: { decrement: item.quantity },
                reservedStockQty: { decrement: item.quantity },
              },
            });
          }
        }
      }

      // If order is CANCELLED, release reserved stock
      if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedStockQty: { decrement: item.quantity },
            },
          });

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                reservedStockQty: { decrement: item.quantity },
              },
            });
          }
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          status,
          timelineEvents: {
            create: {
              status,
              note: note || `Order status updated to ${status}.`,
            },
          },
        },
        include: {
          timelineEvents: true,
          orderItems: { include: { variant: true, product: true } },
        },
      });
    });

    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: { order: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const role = req.user?.role;
  if (role === Role.ADMIN || role === Role.MANAGER) {
    return getAllOrders(req, res, next);
  }
  if (req.user?.id) {
    return getMyOrders(req, res, next);
  }
  return getAllOrders(req, res, next);
};

