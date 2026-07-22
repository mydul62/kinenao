import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "./category.validation";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(createCategorySchema),
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateCategorySchema),
  updateCategory
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deleteCategory
);

export default router;
