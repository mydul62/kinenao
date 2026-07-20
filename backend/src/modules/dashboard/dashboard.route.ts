import { Router } from "express";
import { getMetrics, getChartData } from "./dashboard.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([Role.ADMIN, Role.MANAGER])); // Admin/Manager only

router.get("/metrics", getMetrics);
router.get("/charts", getChartData);

export default router;
