import { Router } from "express";
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from "./banner.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getBanners);
router.get("/:id", getBannerById);
router.post("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), createBanner);
router.patch("/:id", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), updateBanner);
router.delete("/:id", authMiddleware, roleMiddleware([Role.ADMIN]), deleteBanner);

export default router;
