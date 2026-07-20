import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

// Helper to get or create a profile for the user
const getOrCreateProfile = async (userId: string) => {
  let profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
      },
    });
  }
  return profile;
};

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { street, city, postalCode, area, isDefault } = req.body;
    const userId = req.user!.id;

    const profile = await getOrCreateProfile(userId);

    // If isDefault is true, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { profileId: profile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        profileId: profile.id,
        street,
        city,
        postalCode: postalCode || null,
        area: area || null,
        isDefault: isDefault !== undefined ? isDefault : false,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { addresses: true },
    });

    res.status(200).json({
      status: "success",
      data: {
        addresses: profile?.addresses || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const userId = req.user!.id;

    const address = await prisma.address.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!address || address.profile.userId !== userId) {
      throw new NotFoundError("Address not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { street, city, postalCode, area, isDefault } = req.body;
    const userId = req.user!.id;

    const address = await prisma.address.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!address || address.profile.userId !== userId) {
      throw new NotFoundError("Address not found");
    }

    const profile = address.profile;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { profileId: profile.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        street: street !== undefined ? street : address.street,
        city: city !== undefined ? city : address.city,
        postalCode: postalCode !== undefined ? postalCode : address.postalCode,
        area: area !== undefined ? area : address.area,
        isDefault: isDefault !== undefined ? isDefault : address.isDefault,
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        address: updated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const userId = req.user!.id;

    const address = await prisma.address.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!address || address.profile.userId !== userId) {
      throw new NotFoundError("Address not found");
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
