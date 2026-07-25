import { Router } from "express";
import {
  createOrder,
} from "../order/order.controller";
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
import { authMiddleware, optionalAuthMiddleware, roleMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createProductSchema, updateProductSchema } from "./product.validation";
import { Role } from "@prisma/client";

const router = Router();

// Admin/Manager static routes (MUST be defined before /:id)
router.get("/admin/list", optionalAuthMiddleware, getAdminProducts);
router.get("/admin/inventory", optionalAuthMiddleware, getInventoryStats);

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

router.post(
  "/",
  optionalAuthMiddleware,
  validate(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  optionalAuthMiddleware,
  validate(updateProductSchema),
  updateProduct
);

router.patch(
  "/:id",
  optionalAuthMiddleware,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  optionalAuthMiddleware,
  deleteProduct
);

export default router;
