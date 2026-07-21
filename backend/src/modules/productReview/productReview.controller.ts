import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../app/errors/AppError";
import { OrderStatus, Role } from "@prisma/client";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, rating, reviewText, images } = req.body;
    const userId = req.user!.id;

    // Verify if user is a verified buyer (has a DELIVERED order with this product)
    const verifiedBuyer = await prisma.order.findFirst({
      where: {
        customerId: userId,
        status: OrderStatus.DELIVERED,
        orderItems: {
          some: {
            productId: productId,
          },
        },
      },
    });

    if (!verifiedBuyer) {
      throw new BadRequestError("Only verified buyers who have received this product can write a review");
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        customerId: userId,
        productId: productId,
      },
    });

    if (existingReview) {
      throw new BadRequestError("You have already reviewed this product");
    }

    const review = await prisma.review.create({
      data: {
        customerId: userId,
        productId,
        rating,
        reviewText,
        images: images || [],
        isApproved: false, // requires admin moderation
      },
    });

    res.status(201).json({
      status: "success",
      message: "Review submitted successfully and is awaiting moderation",
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        customer: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        product: { select: { name: true, thumbnail: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const approveReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { approve } = req.body; // boolean

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (approve === true) {
      const updated = await prisma.review.update({
        where: { id },
        data: { isApproved: true },
      });
      res.status(200).json({
        status: "success",
        message: "Review approved successfully",
        data: { review: updated },
      });
    } else {
      await prisma.review.delete({ where: { id } });
      res.status(200).json({
        status: "success",
        message: "Review rejected and deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const voteHelpful = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { helpfulVotes: { increment: 1 } },
    });

    res.status(200).json({
      status: "success",
      data: {
        helpfulVotes: updated.helpfulVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { replyText } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { replyText },
    });

    res.status(200).json({
      status: "success",
      message: "Reply added successfully",
      data: {
        review: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isApproved = req.query.isApproved as string | undefined;

    const where: any = {};
    if (isApproved !== undefined) {
      where.isApproved = isApproved === "true";
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        product: { select: { id: true, name: true, thumbnail: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const patchReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isApproved } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: !!isApproved },
    });

    res.status(200).json({
      status: "success",
      message: isApproved ? "Review approved" : "Review marked as unapproved",
      data: { review: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    if (req.user!.role === Role.CUSTOMER && review.customerId !== req.user!.id) {
      throw new ForbiddenError("You cannot delete this review");
    }

    await prisma.review.delete({ where: { id } });
    res.status(200).json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const reviews = await prisma.review.findMany({
      where: { customerId: userId },
      include: {
        product: { select: { id: true, name: true, thumbnail: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
