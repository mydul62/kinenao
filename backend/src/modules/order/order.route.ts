import { Router } from "express";
import {
  createOrder,
  submitPaymentProof,
  verifyPayment,
  updateOrderStatus,
  getOrders,
  getOrderById,
} from "./order.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import {
  createOrderSchema,
  submitPaymentSchema,
  verifyPaymentSchema,
  updateStatusSchema,
} from "./order.validation";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware); // All order actions require authentication

router.post("/", validate(createOrderSchema), createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

router.post("/:id/submit-payment", validate(submitPaymentSchema), submitPaymentProof);

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

export default router;
