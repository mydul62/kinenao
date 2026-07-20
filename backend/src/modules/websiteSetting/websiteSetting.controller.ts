import { Request, Response, NextFunction } from "express";
import * as settingService from "./websiteSetting.service";
import { BadRequestError } from "../../app/errors/AppError";

export const getContentByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params as any;
    const value = await settingService.getSectionContent(key);

    res.status(200).json({
      status: "success",
      data: {
        key,
        value: value || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateContentByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.params as any;
    const { value } = req.body;

    if (value === undefined) {
      throw new BadRequestError("Value payload is required");
    }

    const updated = await settingService.updateSectionContent(key, value);

    res.status(200).json({
      status: "success",
      message: `Section "${key}" updated successfully`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
