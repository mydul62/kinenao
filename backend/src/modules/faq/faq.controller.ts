import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

// ─── CREATE ─────────────────────────────────────────────────────────────────

export const createFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { question, answer, isActive, sortOrder } = req.body;
    if (!question || !answer) throw new BadRequestError("Question and answer are required");

    const faq = await prisma.fAQ.create({
      data: { question, answer, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 },
    });

    res.status(201).json({ status: "success", data: { faq } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL ─────────────────────────────────────────────────────────────────

export const getFAQs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { active } = req.query;
    const where: any = {};
    if (active === "true") where.isActive = true;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    res.status(200).json({ status: "success", data: { faqs } });
  } catch (error) {
    next(error);
  }
};

// ─── GET ONE ─────────────────────────────────────────────────────────────────

export const getFAQById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const faq = await prisma.fAQ.findUnique({ where: { id } });
    if (!faq) throw new NotFoundError("FAQ not found");

    res.status(200).json({ status: "success", data: { faq } });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export const updateFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("FAQ not found");

    const { question, answer, isActive, sortOrder } = req.body;
    const faq = await prisma.fAQ.update({
      where: { id },
      data: { question, answer, isActive, sortOrder },
    });

    res.status(200).json({ status: "success", data: { faq } });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ──────────────────────────────────────────────────────────────────

export const deleteFAQ = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as any;
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("FAQ not found");

    await prisma.fAQ.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "FAQ deleted successfully" });
  } catch (error) {
    next(error);
  }
};
