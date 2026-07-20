import { Router } from "express";
import {
  createDeliveryZone,
  getDeliveryZones,
  getDeliveryZoneById,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "./deliveryZone.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createDeliveryZoneSchema, updateDeliveryZoneSchema } from "./deliveryZone.validation";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getDeliveryZones);
router.get("/:id", getDeliveryZoneById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(createDeliveryZoneSchema),
  createDeliveryZone
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateDeliveryZoneSchema),
  updateDeliveryZone
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deleteDeliveryZone
);

export default router;
