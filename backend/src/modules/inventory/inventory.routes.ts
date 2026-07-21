import { Router } from "express";
import {
  getInventory,
  updateStock,
  getLowStockAlerts,
} from "./inventory.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), getInventory);
router.get("/alerts", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), getLowStockAlerts);
router.patch("/:id/stock", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), updateStock);

export default router;
