import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID"),
    rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
    reviewText: z.string().min(5, "Review text must be at least 5 characters"),
    images: z.array(z.string().url()).optional(),
  }),
});

export const replyReviewSchema = z.object({
  body: z.object({
    replyText: z.string().min(1, "Reply text is required"),
  }),
  params: z.object({
    id: z.string().uuid("Invalid review ID"),
  }),
});
