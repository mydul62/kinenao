import { Router } from "express";
import {
  getContentByKey,
  updateContentByKey,
  getAllSettings,
  createOrUpdateSetting,
} from "./websiteSetting.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

// Retrieve all settings or single key (publicly readable)
router.get("/", getAllSettings);
router.get("/:key", getContentByKey);

// Save setting via POST or PUT (restricted to Admin/Manager)
router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  createOrUpdateSetting
);

router.put(
  "/:key",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  updateContentByKey
);

export default router;
