import { Router } from "express";
import {
  createReview,
  getPendingReviews,
  approveReview,
  voteHelpful,
  replyToReview,
} from "./productReview.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createReviewSchema, replyReviewSchema } from "./productReview.validation";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  createReview
);

router.post(
  "/:id/helpful",
  authMiddleware,
  voteHelpful
);

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  getPendingReviews
);

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  approveReview
);

router.post(
  "/:id/reply",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(replyReviewSchema),
  replyToReview
);

export default router;
