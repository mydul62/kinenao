import { Router } from "express";
import {
  createOrder,
  createDirectOrder,
  submitPaymentProof,
  verifyPayment,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getOrders,
  getOrderById,
} from "./order.controller";
import { authMiddleware, optionalAuthMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import {
  createOrderSchema,
  submitPaymentSchema,
  verifyPaymentSchema,
  updateStatusSchema,
} from "./order.validation";
import { Role } from "@prisma/client";

const router = Router();

router.post("/", optionalAuthMiddleware, validate(createOrderSchema), createOrder);
router.post("/direct", optionalAuthMiddleware, createDirectOrder);
router.post("/:id/submit-payment", optionalAuthMiddleware, validate(submitPaymentSchema), submitPaymentProof);

router.get("/", optionalAuthMiddleware, getOrders);
router.get("/:id", optionalAuthMiddleware, getOrderById);

router.patch("/bulk-status", optionalAuthMiddleware, bulkUpdateOrderStatus);

router.post(
  "/:id/verify-payment",
  optionalAuthMiddleware,
  validate(verifyPaymentSchema),
  verifyPayment
);

router.put(
  "/:id/status",
  optionalAuthMiddleware,
  validate(updateStatusSchema),
  updateOrderStatus
);

router.patch(
  "/:id/status",
  optionalAuthMiddleware,
  validate(updateStatusSchema),
  updateOrderStatus
);

export default router;
