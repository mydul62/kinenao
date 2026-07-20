import { Request, Response, NextFunction } from "express";
import * as brandService from "./brand.service";

export const createBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const brand = await brandService.dbCreateBrand(req.body);
    res.status(201).json({
      status: "success",
      data: {
        brand,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { activeOnly } = req.query as any;
    const brands = await brandService.dbGetBrands(activeOnly as string);
    res.status(200).json({
      status: "success",
      data: {
        brands,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const brand = await brandService.dbGetBrandById(id);
    res.status(200).json({
      status: "success",
      data: {
        brand,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const brand = await brandService.dbUpdateBrand(id, req.body);
    res.status(200).json({
      status: "success",
      data: {
        brand,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    await brandService.dbDeleteBrand(id);
    res.status(200).json({
      status: "success",
      message: "Brand deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
