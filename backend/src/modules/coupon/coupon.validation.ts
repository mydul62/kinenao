import { z } from "zod";
import { CouponType } from "@prisma/client";

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Coupon code must be at least 3 characters").toUpperCase(),
    type: z.nativeEnum(CouponType, { message: "Invalid coupon type" }),
    value: z.number().nonnegative("Value must be non-negative"),
    minPurchase: z.number().nonnegative("Min purchase must be non-negative").default(0),
    usageLimit: z.number().int().positive("Usage limit must be positive").default(1),
    expiresAt: z.string().datetime("Expires date must be a valid ISO datetime string"),
    isActive: z.boolean().optional(),
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).toUpperCase().optional(),
    type: z.nativeEnum(CouponType).optional(),
    value: z.number().nonnegative().optional(),
    minPurchase: z.number().nonnegative().optional(),
    usageLimit: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid coupon ID"),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Coupon code is required").toUpperCase(),
    purchaseAmount: z.number().positive("Purchase amount must be positive"),
  }),
});
