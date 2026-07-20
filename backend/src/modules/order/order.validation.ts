import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    ).min(1, "Order must contain at least one item"),
    deliveryAddressId: z.string().uuid("Invalid address ID"),
    deliveryZoneId: z.string().uuid("Invalid delivery zone ID"),
    couponCode: z.string().toUpperCase().optional().nullable(),
    customerNote: z.string().optional().nullable(),
  }),
});

export const submitPaymentSchema = z.object({
  body: z.object({
    paymentMethodId: z.string().uuid("Invalid payment method ID"),
    senderNumber: z.string().min(10, "Sender phone number must be at least 10 digits"),
    transactionId: z.string().min(5, "Transaction ID must be at least 5 characters"),
    paidAmount: z.number().positive("Paid amount must be positive"),
    paymentScreenshotUrl: z.string().url("Invalid screenshot URL").optional().nullable(),
    customerNote: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, { message: "Invalid order status" }),
    note: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
    note: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
});
