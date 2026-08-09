import { z } from "zod";

const optionalString = z.string().optional().nullable().transform((val) => (val === "" ? null : val));

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  colorName: optionalString,
  colorCode: optionalString,
  imageUrl: optionalString,
  sku: optionalString,
  price: z.number().nonnegative().optional().nullable(),
  discountPrice: z.number().nonnegative().optional().nullable(),
  stockQty: z.number().int().nonnegative().default(0),
  size: optionalString,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    barcode: optionalString,
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category is required"),
    brandId: optionalString,
    price: z.number().nonnegative("Price must be a non-negative number"),
    discountPrice: z.number().nonnegative().optional().nullable(),
    weight: z.number().positive().optional().nullable(),
    unit: optionalString,
    stockQty: z.number().int().nonnegative().default(0),
    tags: optionalString,
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isFlashSale: z.boolean().optional(),
    customBadge: optionalString,
    promotionalBadges: z.array(z.string()).optional(),
    seoTitle: optionalString,
    seoDescription: optionalString,
    isActive: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    thumbnail: optionalString,
    videoUrl: optionalString,
    videoPosterUrl: optionalString,
    variants: z.array(variantSchema).optional(),
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
    name: z.string().min(1, "Product name is required").optional(),
    sku: z.string().min(1, "SKU is required").optional(),
    barcode: optionalString,
    description: z.string().min(1, "Description is required").optional(),
    categoryId: z.string().min(1, "Category is required").optional(),
    brandId: optionalString,
    price: z.number().nonnegative("Price must be non-negative").optional(),
    discountPrice: z.number().nonnegative().optional().nullable(),
    weight: z.number().positive().optional().nullable(),
    unit: optionalString,
    stockQty: z.number().int().nonnegative().optional(),
    tags: optionalString,
    isFeatured: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isFlashSale: z.boolean().optional(),
    customBadge: optionalString,
    promotionalBadges: z.array(z.string()).optional(),
    seoTitle: optionalString,
    seoDescription: optionalString,
    isActive: z.boolean().optional(),
    images: z.array(z.string()).optional(),
    thumbnail: optionalString,
    videoUrl: optionalString,
    videoPosterUrl: optionalString,
    variants: z.array(variantSchema).optional(),
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
    id: z.string().min(1, "Invalid product ID"),
  }),
});
