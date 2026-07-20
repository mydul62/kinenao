import { Request, Response, NextFunction } from "express";
import { prisma } from "../../app/config/db";
import { NotFoundError, BadRequestError } from "../../app/errors/AppError";

export const createPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, logoUrl, accountNumber, accountName, accountType, instructions, isActive } =
      req.body;

    const existing = await prisma.paymentMethod.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestError(`Payment method "${name}" already exists`);
    }

    const method = await prisma.paymentMethod.create({
      data: {
        name,
        logoUrl: logoUrl || null,
        accountNumber,
        accountName: accountName || null,
        accountType: accountType || null,
        instructions,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        paymentMethod: method,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activeOnly } = req.query;
    const filter: any = {};
    if (activeOnly === "true") {
      filter.isActive = true;
    }

    const methods = await prisma.paymentMethod.findMany({
      where: filter,
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      status: "success",
      data: {
        paymentMethods: methods,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethodById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const method = await prisma.paymentMethod.findUnique({ where: { id } });

    if (!method) {
      throw new NotFoundError("Payment method not found");
    }

    res.status(200).json({
      status: "success",
      data: {
        paymentMethod: method,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;
    const { name, logoUrl, accountNumber, accountName, accountType, instructions, isActive } =
      req.body;

    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundError("Payment method not found");
    }

    const data: any = {};
    if (name) {
      const existing = await prisma.paymentMethod.findFirst({
        where: { name, id: { not: id } },
      });
      if (existing) {
        throw new BadRequestError(`Payment method "${name}" already exists`);
      }
      data.name = name;
    }
    if (logoUrl !== undefined) data.logoUrl = logoUrl;
    if (accountNumber !== undefined) data.accountNumber = accountNumber;
    if (accountName !== undefined) data.accountName = accountName;
    if (accountType !== undefined) data.accountType = accountType;
    if (instructions !== undefined) data.instructions = instructions;
    if (isActive !== undefined) data.isActive = isActive;

    const updatedMethod = await prisma.paymentMethod.update({
      where: { id },
      data,
    });

    res.status(200).json({
      status: "success",
      data: {
        paymentMethod: updatedMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as any;

    const method = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundError("Payment method not found");
    }

    const hasOrders = await prisma.order.findFirst({ where: { paymentMethodId: id } });
    if (hasOrders) {
      throw new BadRequestError("Cannot delete payment method as it is referenced in orders");
    }

    await prisma.paymentMethod.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
