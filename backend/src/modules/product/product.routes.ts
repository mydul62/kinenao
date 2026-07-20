import { Router } from "express";
import {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getInventoryStats,
} from "./product.controller";
import { authMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { Role } from "@prisma/client";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

// Admin/Manager routes
router.get(
  "/admin/list",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  getAdminProducts
);

router.get(
  "/admin/inventory",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  getInventoryStats
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN, Role.MANAGER]),
  deleteProduct
);

export default router;
