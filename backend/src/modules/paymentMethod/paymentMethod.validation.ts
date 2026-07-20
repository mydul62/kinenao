import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Payment method name must be at least 2 characters"),
    logoUrl: z.string().url("Invalid logo URL").nullable().optional(),
    accountNumber: z.string().min(4, "Account number must be at least 4 digits"),
    accountName: z.string().min(2, "Account name must be at least 2 characters").optional().nullable(),
    accountType: z.string().min(2, "Account type must be at least 2 characters").optional().nullable(),
    instructions: z.string().min(10, "Instructions must be at least 10 characters"),
    isActive: z.boolean().optional(),
  }),
});

export const updatePaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    logoUrl: z.string().url().nullable().optional(),
    accountNumber: z.string().min(4).optional(),
    accountName: z.string().min(2).optional().nullable(),
    accountType: z.string().min(2).optional().nullable(),
    instructions: z.string().min(10).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid payment method ID"),
  }),
});
