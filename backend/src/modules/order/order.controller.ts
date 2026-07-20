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
    const { items, deliveryAddressId, deliveryZoneId, couponCode, customerNote } = req.body;
    const userId = req.user!.id;

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch and validate delivery address
      const address = await tx.address.findUnique({
        where: { id: deliveryAddressId },
        include: { profile: true },
      });
      if (!address || address.profile.userId !== userId) {
        throw new BadRequestError("Invalid delivery address");
      }

      // 2. Fetch and validate delivery zone
      const zone = await tx.deliveryZone.findUnique({ where: { id: deliveryZoneId } });
      if (!zone) {
        throw new BadRequestError("Invalid delivery zone");
      }

      let deliveryCharge = zone.charge;

      // 3. Process products and check stock availability
      let itemsSubtotal = 0;
      const orderItemsData: any[] = [];
      const productUpdates: any[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new NotFoundError(`Product "${item.productId}" not found or inactive`);
        }

        const availableStock = product.stockQty - product.reservedStockQty;
        if (availableStock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }

        const purchasePrice =
          product.discountPrice !== null ? product.discountPrice : product.price;
        const lineTotal = purchasePrice * item.quantity;
        itemsSubtotal += lineTotal;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: purchasePrice,
        });

        productUpdates.push({
          id: product.id,
          reservedStockQty: product.reservedStockQty + item.quantity,
        });
      }

      // 4. Validate Coupon if provided
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

      // 5. Update reserved stock quantities
      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: { reservedStockQty: update.reservedStockQty },
        });
      }

      // 6. Create the Order
      const order = await tx.order.create({
        data: {
          customerId: userId,
          status: OrderStatus.PENDING_PAYMENT,
          deliveryZoneId,
          deliveryCharge,
          grandTotal,
          deliveryAddressId,
          couponId,
          customerNote,
          orderItems: {
            create: orderItemsData,
          },
          timelineEvents: {
            create: {
              status: OrderStatus.PENDING_PAYMENT,
              note: "Order created, waiting for payment submission.",
            },
          },
        },
        include: {
          orderItems: {
            include: { product: { select: { name: true, thumbnail: true } } },
          },
          timelineEvents: true,
          deliveryAddress: true,
          deliveryZone: true,
        },
      });

      return order;
    });

    res.status(201).json({
      status: "success",
      message: "Order placed successfully. Complete payment to proceed.",
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
    const { paymentMethodId, senderNumber, transactionId, paidAmount, paymentScreenshotUrl, customerNote } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.customerId !== userId) {
      throw new ForbiddenError("You do not have permission to access this order");
    }

    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PENDING_PAYMENT_VERIFICATION
    ) {
      throw new BadRequestError(`Cannot submit payment for an order with status: ${order.status}`);
    }

    const method = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
    if (!method || !method.isActive) {
      throw new BadRequestError("Invalid or inactive payment method selected");
    }

    // Update order with proof
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentMethodId,
        senderNumber,
        transactionId,
        paidAmount,
        paymentScreenshotUrl: paymentScreenshotUrl || null,
        customerNote: customerNote || order.customerNote,
        status: OrderStatus.PENDING_PAYMENT_VERIFICATION,
        timelineEvents: {
          create: {
            status: OrderStatus.PENDING_PAYMENT_VERIFICATION,
            note: `Payment proof submitted via ${method.name}. TxID: ${transactionId}. Waiting for review.`,
          },
        },
      },
      include: {
        timelineEvents: true,
        paymentMethod: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Payment proof submitted. Admin will verify details shortly.",
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
    const { isApproved, note } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT_VERIFICATION) {
      throw new BadRequestError("Only orders awaiting payment verification can be verified");
    }

    let nextStatus: OrderStatus;
    let eventNote: string;

    if (isApproved) {
      nextStatus = OrderStatus.CONFIRMED;
      eventNote = note || "Payment verified successfully. Order confirmed.";
    } else {
      nextStatus = OrderStatus.PENDING_PAYMENT;
      eventNote = note || "Payment verification rejected. Reverted to pending payment.";
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        timelineEvents: {
          create: {
            status: nextStatus,
            note: eventNote,
          },
        },
      },
      include: {
        timelineEvents: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: isApproved ? "Payment approved and order confirmed" : "Payment proof rejected",
      data: {
        order: updatedOrder,
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestError(`Cannot update status of a finalized order: ${order.status}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Handle stock logic when status is updated
      if (status === OrderStatus.DELIVERED) {
        // Delivered: reserved -> sold
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedStockQty: { decrement: item.quantity },
              stockQty: { decrement: item.quantity },
              soldQty: { increment: item.quantity },
            },
          });
        }
      } else if (status === OrderStatus.CANCELLED) {
        // Cancelled: restore reserved stock
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              reservedStockQty: { decrement: item.quantity },
            },
          });
        }

        // Revert coupon usage count
        if (order.couponId) {
          await tx.coupon.update({
            where: { id: order.couponId },
            data: {
              usageCount: { decrement: 1 },
            },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          timelineEvents: {
            create: {
              status,
              note: note || `Order status updated to ${status}`,
            },
          },
        },
        include: {
          timelineEvents: true,
        },
      });

      return updated;
    });

    res.status(200).json({
      status: "success",
      message: `Order status updated to ${status}`,
      data: {
        order: result,
      },
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
  try {
    const { status, page = "1", limit = "10", search } = req.query;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    const queryFilters: any[] = [];

    // Filter by customer if role is Customer
    if (userRole === Role.CUSTOMER) {
      queryFilters.push({ customerId: userId });
    }

    if (status) {
      queryFilters.push({ status: status as OrderStatus });
    }

    if (search && userRole !== Role.CUSTOMER) {
      queryFilters.push({
        OR: [
          { customer: { email: { contains: search as string, mode: "insensitive" } } },
          { customer: { profile: { fullName: { contains: search as string, mode: "insensitive" } } } },
          { transactionId: { contains: search as string, mode: "insensitive" } },
        ],
      });
    }

    const where = queryFilters.length > 0 ? { AND: queryFilters } : {};

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, phoneNumber: true } },
            },
          },
          paymentMethod: true,
          deliveryZone: true,
          orderItems: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: skipNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        orders,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
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
    const userId = req.user!.id;
    const role = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phoneNumber: true } },
          },
        },
        paymentMethod: true,
        deliveryZone: true,
        deliveryAddress: true,
        coupon: true,
        orderItems: {
          include: {
            product: { select: { id: true, name: true, slug: true, thumbnail: true } },
          },
        },
        timelineEvents: { orderBy: { timestamp: "asc" } },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (role === Role.CUSTOMER && order.customerId !== userId) {
      throw new ForbiddenError("You do not have permission to view this order");
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
