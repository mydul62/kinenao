import { Router } from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "./address.controller";
import { authMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { createAddressSchema, updateAddressSchema } from "./address.validation";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createAddressSchema), createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressById);
router.put("/:id", validate(updateAddressSchema), updateAddress);
router.delete("/:id", deleteAddress);

export default router;
