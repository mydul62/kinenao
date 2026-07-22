import { Router } from "express";
import {
  createReview,
  getPendingReviews,
  approveReview,
  voteHelpful,
  replyToReview,
  getReviews,
  patchReview,
  deleteReview,
  getMyReviews,
  getProductReviewsByProductId,
} from "./productReview.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createReviewSchema, replyReviewSchema } from "./productReview.validation";
import { Role } from "@prisma/client";

const router = Router();

// Public / Customer routes
router.get(
  "/product/:productId",
  getProductReviewsByProductId
);

router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  createReview
);

router.get(
  "/",
  getReviews
);

router.get(
  "/my",
  authMiddleware,
  getMyReviews
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReview
);

router.post(
  "/:id/helpful",
  authMiddleware,
  voteHelpful
);

// Admin / Moderation routes
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

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  patchReview
);

router.post(
  "/:id/reply",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(replyReviewSchema),
  replyToReview
);

export default router;
