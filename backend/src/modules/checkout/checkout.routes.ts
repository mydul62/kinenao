import { Router } from "express";
import { previewCheckout } from "./checkout.controller";
import { authMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { checkoutPreviewSchema } from "./checkout.validation";

const router = Router();

router.post(
  "/preview",
  authMiddleware,
  validate(checkoutPreviewSchema),
  previewCheckout
);

export default router;
