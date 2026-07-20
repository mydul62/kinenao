import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    sku: z.string().min(3, "SKU must be at least 3 characters"),
    barcode: z.string().optional().nullable(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().uuid("Invalid category ID"),
    brandId: z.string().uuid("Invalid brand ID").optional().nullable(),
    price: z.number().nonnegative("Price must be a non-negative number"),
    discountPrice: z.number().nonnegative("Discount price must be non-negative").optional().nullable(),
    weight: z.number().positive("Weight must be positive").optional().nullable(),
    unit: z.string().optional().nullable(),
    stockQty: z.number().int().nonnegative("Stock quantity must be non-negative").default(0),
    tags: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isFlashSale: z.boolean().optional(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    images: z.array(z.string().url()).optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional().nullable(),
  }).refine((data) => {
    if (data.discountPrice !== undefined && data.discountPrice !== null) {
      return data.discountPrice < data.price;
    }
    return true;
  }, {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Product name must be at least 2 characters").optional(),
    sku: z.string().min(3, "SKU must be at least 3 characters").optional(),
    barcode: z.string().optional().nullable(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    brandId: z.string().uuid("Invalid brand ID").optional().nullable(),
    price: z.number().nonnegative("Price must be non-negative").optional(),
    discountPrice: z.number().nonnegative("Discount price must be non-negative").optional().nullable(),
    weight: z.number().positive("Weight must be positive").optional().nullable(),
    unit: z.string().optional().nullable(),
    stockQty: z.number().int().nonnegative("Stock quantity must be non-negative").optional(),
    tags: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isFlashSale: z.boolean().optional(),
    seoTitle: z.string().optional().nullable(),
    seoDescription: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    images: z.array(z.string().url()).optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional().nullable(),
  }).refine((data) => {
    if (data.price !== undefined && data.discountPrice !== undefined && data.discountPrice !== null) {
      return data.discountPrice < data.price;
    }
    return true;
  }, {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  }),
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
});
