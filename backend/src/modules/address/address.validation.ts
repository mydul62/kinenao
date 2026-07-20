import { z } from "zod";

export const createAddressSchema = z.object({
  body: z.object({
    street: z.string().min(3, "Street address must be at least 3 characters"),
    city: z.string().min(2, "City name must be at least 2 characters"),
    postalCode: z.string().optional().nullable(),
    area: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    street: z.string().min(3).optional(),
    city: z.string().min(2).optional(),
    postalCode: z.string().optional().nullable(),
    area: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid address ID"),
  }),
});
