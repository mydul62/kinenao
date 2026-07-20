import { Router } from "express";
import { getContentByKey, updateContentByKey } from "./websiteSetting.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

// Publicly read content (e.g. settings, banners, faqs, testimonials)
router.get("/:key", getContentByKey);

// Admin/Manager only to write/update
router.put(
  "/:key",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  updateContentByKey
);

export default router;
