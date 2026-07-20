import { Router } from "express";
import {
  createPaymentMethod,
  getPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  deletePaymentMethod,
} from "./paymentMethod.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./paymentMethod.validation";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getPaymentMethods);
router.get("/:id", getPaymentMethodById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(createPaymentMethodSchema),
  createPaymentMethod
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updatePaymentMethodSchema),
  updatePaymentMethod
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deletePaymentMethod
);

export default router;
