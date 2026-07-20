import { Router } from "express";
import { subscribe, listSubscribers } from "./newsletter.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { subscribeNewsletterSchema } from "./newsletter.validation";
import { Role } from "@prisma/client";

const router = Router();

// Public route to subscribe
router.post(
  "/subscribe",
  validate(subscribeNewsletterSchema),
  subscribe
);

// Admin route to list subscribers
router.get(
  "/subscribers",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  listSubscribers
);

export default router;
