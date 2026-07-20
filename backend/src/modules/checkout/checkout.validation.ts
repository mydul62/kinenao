import { z } from "zod";

export const checkoutPreviewSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    ).min(1, "Cart must contain at least one item"),
    deliveryZoneId: z.string().uuid("Invalid delivery zone ID"),
    couponCode: z.string().toUpperCase().optional().nullable(),
  }),
});
