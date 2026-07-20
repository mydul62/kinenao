import { Router } from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "./coupon.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from "./coupon.validation";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/validate",
  authMiddleware,
  validate(validateCouponSchema),
  validateCoupon
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  getCoupons
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  getCouponById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(createCouponSchema),
  createCoupon
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateCouponSchema),
  updateCoupon
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deleteCoupon
);

export default router;
