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

export const deleteSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await newsletterService.unsubscribeEmail(id);
    res.status(200).json({
      status: "success",
      message: "Subscriber removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
