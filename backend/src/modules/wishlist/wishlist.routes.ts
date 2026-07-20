import { Router } from "express";
import { toggleWishlistItem, getWishlist } from "./wishlist.controller";
import { authMiddleware } from "../../app/middlewares/auth";
import { validate } from "../../app/middlewares/validate";
import { toggleWishlistSchema } from "./wishlist.validation";

const router = Router();

router.use(authMiddleware);

router.post("/toggle", validate(toggleWishlistSchema), toggleWishlistItem);
router.get("/", getWishlist);

export default router;
