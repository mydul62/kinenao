import { z } from "zod";

const optionalString = z.string().optional().nullable().transform((v) => (v === "" ? null : v));

export const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Payment method name must be at least 2 characters"),
    logoUrl: optionalString,
    accountNumber: z.string().min(1, "Account number is required"),
    accountName: optionalString,
    accountType: optionalString,
    instructions: z.string().optional().nullable().transform((v) => (v === undefined ? "" : v)),
    isActive: z.boolean().optional(),
  }),
});

export const updatePaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    logoUrl: optionalString,
    accountNumber: z.string().optional(),
    accountName: optionalString,
    accountType: optionalString,
    instructions: optionalString,
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Invalid payment method ID"),
  }),
});
