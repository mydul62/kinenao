import { Request, Response, NextFunction } from "express";
import * as categoryService from "./category.service";

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await categoryService.dbCreateCategory(req.body);
    res.status(201).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, includeInactive } = req.query as any;
    const categories = await categoryService.dbGetCategories(
      type as string,
      includeInactive === "true" || includeInactive === true
    );
    res.status(200).json({
      status: "success",
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const category = await categoryService.dbGetCategoryByIdOrSlug(id);
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const category = await categoryService.dbUpdateCategory(id, req.body);
    res.status(200).json({
      status: "success",
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    await categoryService.dbDeleteCategory(id);
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
