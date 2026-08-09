import { z } from "zod";

const optionalString = z.string().optional().nullable().transform((v) => (v === "" ? null : v));

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    slug: optionalString,
    imageUrl: optionalString,
    description: optionalString,
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    isFeatured: z.boolean().optional(),
    parentId: optionalString,
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").optional(),
    slug: optionalString,
    imageUrl: optionalString,
    description: optionalString,
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    isFeatured: z.boolean().optional(),
    parentId: optionalString,
  }),
  params: z.object({
    id: z.string().min(1, "Invalid category ID"),
  }),
});
