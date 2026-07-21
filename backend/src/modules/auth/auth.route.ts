import { Router } from "express";
import {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  updateProfile,
} from "./auth.controller";
import { authMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authMiddleware, getMe);

// Profiles & Security
router.patch("/change-password", authMiddleware, changePassword);
router.patch("/profile", authMiddleware, updateProfile);

export default router;
