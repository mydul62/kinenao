import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1, "Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be positive"),
      })
    ).min(1, "Order must contain at least one item"),
    deliveryAddressId: z.string().optional().nullable(),
    guestInfo: z.object({
      fullName: z.string().min(1, "Full Name is required"),
      email: z.string().optional().nullable().or(z.literal("")),
      phone: z.string().min(1, "Phone number is required"),
      street: z.string().min(1, "Street address is required"),
      city: z.string().optional().nullable().or(z.literal("")),
      postalCode: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      orderNotes: z.string().optional().nullable(),
    }).optional().nullable(),
    deliveryZoneId: z.string().min(1, "Invalid delivery zone ID"),
    couponCode: z.string().toUpperCase().optional().nullable(),
    customerNote: z.string().optional().nullable(),
  }),
});

export const submitPaymentSchema = z.object({
  body: z.object({
    paymentMethodId: z.string().min(1, "Invalid payment method ID"),
    senderNumber: z.string().optional().nullable().or(z.literal("")),
    transactionId: z.string().optional().nullable().or(z.literal("")),
    paidAmount: z.number().positive("Paid amount must be positive"),
    paymentScreenshotUrl: z.string().url("Invalid screenshot URL").optional().nullable(),
    customerNote: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, "Invalid order ID"),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus, { message: "Invalid order status" }),
    note: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, "Invalid order ID"),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
    note: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, "Invalid order ID"),
  }),
});
