import { Router } from "express";
import { subscribe, listSubscribers, deleteSubscriber } from "./newsletter.controller";
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

// Admin route to list subscribers (both GET / and GET /subscribers work)
router.get(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  listSubscribers
);

router.get(
  "/subscribers",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  listSubscribers
);

// Admin route to delete/remove subscriber
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deleteSubscriber
);

export default router;
