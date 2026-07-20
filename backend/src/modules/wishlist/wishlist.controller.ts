import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError } from "../../app/errors/AppError";

export const toggleWishlistItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.body;
    const userId = req.user!.id;

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Check if already wishlisted
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      res.status(200).json({
        status: "success",
        message: "Product removed from wishlist",
        data: {
          wishlisted: false,
        },
      });
    } else {
      // Add to wishlist
      const item = await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Product added to wishlist",
        data: {
          item,
          wishlisted: true,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            discountPrice: true,
            thumbnail: true,
            stockQty: true,
            reservedStockQty: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        wishlist,
      },
    });
  } catch (error) {
    next(error);
  }
};
