import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters"),
    parentId: z.string().uuid("Invalid parent category ID").nullable().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Category name must be at least 2 characters").optional(),
    parentId: z.string().uuid("Invalid parent category ID").nullable().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid category ID"),
  }),
});
