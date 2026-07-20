import { z } from "zod";

export const createDeliveryZoneSchema = z.object({
  body: z.object({
    zoneName: z.string().min(2, "Zone name must be at least 2 characters"),
    charge: z.number().nonnegative("Charge must be non-negative"),
    estDeliveryTime: z.string().min(1, "Estimated delivery time is required"),
  }),
});

export const updateDeliveryZoneSchema = z.object({
  body: z.object({
    zoneName: z.string().min(2).optional(),
    charge: z.number().nonnegative().optional(),
    estDeliveryTime: z.string().min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid delivery zone ID"),
  }),
});
