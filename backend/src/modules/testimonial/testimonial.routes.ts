import { Router } from "express";
import {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "./testimonial.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);
router.post("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), createTestimonial);
router.patch("/:id", authMiddleware, roleMiddleware([Role.ADMIN, Role.MANAGER]), updateTestimonial);
router.delete("/:id", authMiddleware, roleMiddleware([Role.ADMIN]), deleteTestimonial);

export default router;
