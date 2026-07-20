import { z } from "zod";

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters"),
    logoUrl: z.string().url("Invalid logo URL").nullable().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters").optional(),
    logoUrl: z.string().url("Invalid logo URL").nullable().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid brand ID"),
  }),
});
