import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError } from "../../app/errors/AppError";

// ─── GET ALL INVENTORY ────────────────────────────────────────────────────────

export const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, lowStock, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { sku: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (lowStock === "true") {
      where.stockQty = { lte: 10 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          sku: true,
          thumbnail: true,
          stockQty: true,
          reservedStockQty: true,
          soldQty: true,
          isActive: true,
          category: { select: { name: true } },
        },
        orderBy: { stockQty: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    const lowStockCount = await prisma.product.count({ where: { stockQty: { lte: 10, gte: 1 } } });
    const outOfStockCount = await prisma.product.count({ where: { stockQty: 0 } });

    res.status(200).json({
      status: "success",
      data: {
        inventory: products,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
        summary: { lowStockCount, outOfStockCount },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE STOCK ─────────────────────────────────────────────────────────────

export const updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { stockQty } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError("Product not found");

    const updated = await prisma.product.update({
      where: { id },
      data: { stockQty: Number(stockQty) },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQty: true,
        reservedStockQty: true,
        soldQty: true,
      },
    });

    res.status(200).json({ status: "success", data: { product: updated } });
  } catch (error) {
    next(error);
  }
};

// ─── GET LOW STOCK ALERTS ────────────────────────────────────────────────────

export const getLowStockAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { threshold = "10" } = req.query;

    const products = await prisma.product.findMany({
      where: { stockQty: { lte: Number(threshold) } },
      select: {
        id: true,
        name: true,
        sku: true,
        thumbnail: true,
        stockQty: true,
        category: { select: { name: true } },
      },
      orderBy: { stockQty: "asc" },
    });

    res.status(200).json({ status: "success", data: { alerts: products, count: products.length } });
  } catch (error) {
    next(error);
  }
};
