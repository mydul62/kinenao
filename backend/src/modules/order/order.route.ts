import { Router } from "express";
import {
  createOrder,
  submitPaymentProof,
  verifyPayment,
  updateOrderStatus,
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
router.post("/:id/submit-payment", optionalAuthMiddleware, validate(submitPaymentSchema), submitPaymentProof);

router.get("/", authMiddleware, getOrders);
router.get("/:id", optionalAuthMiddleware, getOrderById);

// Admin/Manager routes
router.post(
  "/:id/verify-payment",
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(verifyPaymentSchema),
  verifyPayment
);

router.put(
  "/:id/status",
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateStatusSchema),
  updateOrderStatus
);

router.patch(
  "/:id/status",
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateStatusSchema),
  updateOrderStatus
);

export default router;
