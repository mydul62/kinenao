import { z } from "zod";

const optionalString = z.string().optional().nullable().transform((v) => (v === "" ? null : v));

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters"),
    slug: optionalString,
    logoUrl: optionalString,
    isActive: z.boolean().optional(),
  }),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Brand name must be at least 2 characters").optional(),
    slug: optionalString,
    logoUrl: optionalString,
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Invalid brand ID"),
  }),
});
