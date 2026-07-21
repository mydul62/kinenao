import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

// ─── CREATE ─────────────────────────────────────────────────────────────────

export const createTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerName, avatarUrl, message, rating, isActive, sortOrder } = req.body;
    if (!customerName || !message) throw new BadRequestError("Customer name and message are required");
    if (rating && (rating < 1 || rating > 5)) throw new BadRequestError("Rating must be between 1 and 5");

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName,
        avatarUrl,
        message,
        rating: rating ?? 5,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    res.status(201).json({ status: "success", data: { testimonial } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────

export const getTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { active } = req.query;
    const where: any = {};
    if (active === "true") where.isActive = true;

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    res.status(200).json({ status: "success", data: { testimonials } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────

export const getTestimonialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundError("Testimonial not found");

    res.status(200).json({ status: "success", data: { testimonial } });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export const updateTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Testimonial not found");

    const { customerName, avatarUrl, message, rating, isActive, sortOrder } = req.body;
    if (rating && (rating < 1 || rating > 5)) throw new BadRequestError("Rating must be between 1 and 5");

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { customerName, avatarUrl, message, rating, isActive, sortOrder },
    });

    res.status(200).json({ status: "success", data: { testimonial } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Testimonial not found");

    await prisma.testimonial.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Testimonial deleted successfully" });
  } catch (error) {
    next(error);
  }
};
