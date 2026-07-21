import { Router } from "express";
import { getMetrics, getChartData, getCustomers } from "./dashboard.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware([Role.ADMIN, Role.MANAGER]));

router.get("/metrics", getMetrics);
router.get("/charts", getChartData);
router.get("/customers", getCustomers);

export default router;
