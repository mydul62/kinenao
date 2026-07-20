import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { OrderStatus, Role } from "@prisma/client";

export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Total Revenue (Paid/Confirmed/Delivered orders)
    const paidOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.PACKED,
            OrderStatus.SHIPPED,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.DELIVERED,
          ],
        },
      },
      select: { grandTotal: true },
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.grandTotal, 0);

    // 2. Count metrics
    const [totalOrders, totalCustomers, pendingOrders, pendingPayments, lowStockCount] =
      await Promise.all([
        prisma.order.count(),
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        prisma.order.count({
          where: {
            status: {
              in: [
                OrderStatus.CONFIRMED,
                OrderStatus.PACKED,
                OrderStatus.SHIPPED,
                OrderStatus.OUT_FOR_DELIVERY,
              ],
            },
          },
        }),
        prisma.order.count({ where: { status: OrderStatus.PENDING_PAYMENT_VERIFICATION } }),
        prisma.product.count({
          where: {
            stockQty: { lte: 10 },
          },
        }),
      ]);

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        pendingOrders,
        pendingPayments,
        lowStockCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChartData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Order Status Distribution
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const orderStatusDistribution = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // 2. Monthly Sales (completed orders in current year)
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

    const yearOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYear },
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.PACKED,
            OrderStatus.SHIPPED,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.DELIVERED,
          ],
        },
      },
      select: { createdAt: true, grandTotal: true },
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlySalesMap: Record<string, number> = {};
    months.forEach((m) => (monthlySalesMap[m] = 0));

    yearOrders.forEach((order) => {
      const monthIndex = new Date(order.createdAt).getMonth();
      const monthName = months[monthIndex];
      monthlySalesMap[monthName] += order.grandTotal;
    });

    const monthlySales = Object.keys(monthlySalesMap).map((key) => ({
      month: key,
      sales: monthlySalesMap[key],
    }));

    // 3. Top Selling Products
    const topItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const topSellingProducts = await Promise.all(
      topItems.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, thumbnail: true },
        });
        return {
          productId: item.productId,
          name: prod?.name || "Unknown Product",
          thumbnail: prod?.thumbnail || null,
          totalQty: item._sum.quantity || 0,
        };
      })
    );

    // 4. Category Sales Distribution
    const itemsSold = await prisma.orderItem.findMany({
      select: {
        quantity: true,
        price: true,
        product: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    });

    const categorySalesMap: Record<string, number> = {};
    itemsSold.forEach((item) => {
      const categoryName = item.product?.category?.name || "Uncategorized";
      const totalAmount = item.quantity * item.price;
      categorySalesMap[categoryName] = (categorySalesMap[categoryName] || 0) + totalAmount;
    });

    const categorySales = Object.keys(categorySalesMap).map((key) => ({
      category: key,
      value: categorySalesMap[key],
    }));

    res.status(200).json({
      status: "success",
      data: {
        orderStatusDistribution,
        monthlySales,
        topSellingProducts,
        categorySales,
      },
    });
  } catch (error) {
    next(error);
  }
};
