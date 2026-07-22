import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

// ─── CREATE ─────────────────────────────────────────────────────────────────

export const createBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, subtitle, imageUrl, linkUrl, isActive, sortOrder } = req.body;
    if (!title || !imageUrl) throw new BadRequestError("Title and imageUrl are required");

    const banner = await prisma.banner.create({
      data: { title, subtitle, imageUrl, linkUrl, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
    });

    res.status(201).json({ status: "success", data: { banner } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────

export const getBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { active } = req.query;
    const where: any = {};
    if (active === "true") where.isActive = true;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    res.status(200).json({ status: "success", data: { banners } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────

export const getBannerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundError("Banner not found");

    res.status(200).json({ status: "success", data: { banner } });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export const updateBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner not found");

    const { title, subtitle, imageUrl, linkUrl, isActive, sortOrder } = req.body;
    const banner = await prisma.banner.update({
      where: { id },
      data: { title, subtitle, imageUrl, linkUrl, isActive, sortOrder },
    });

    res.status(200).json({ status: "success", data: { banner } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const deleteBanner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Banner not found");

    await prisma.banner.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Banner deleted successfully" });
  } catch (error) {
    next(error);
  }
};
