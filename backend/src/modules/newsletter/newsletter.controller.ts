import { Request, Response, NextFunction } from "express";
import * as newsletterService from "./newsletter.service";

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscriber = await newsletterService.subscribeEmail(req.body);
    res.status(201).json({
      status: "success",
      message: "Subscribed to newsletter successfully",
      data: {
        subscriber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subscribers = await newsletterService.getSubscribers();
    res.status(200).json({
      status: "success",
      data: {
        subscribers,
      },
    });
  } catch (error) {
    next(error);
  }
};
