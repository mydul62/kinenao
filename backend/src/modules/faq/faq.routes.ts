import { Router } from "express";
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from "./faq.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getFAQs);
router.get("/:id", getFAQById);
router.post("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), createFAQ);
router.patch("/:id", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), updateFAQ);
router.delete("/:id", authMiddleware, roleMiddleware([Role.ADMIN]), deleteFAQ);

export default router;
