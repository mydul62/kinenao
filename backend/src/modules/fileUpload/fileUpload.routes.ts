import { Router, Request, Response, NextFunction } from "express";
import { upload, uploadToCloudinary } from "../../app/middlewares/upload";
import { BadRequestError } from "../../app/errors/AppError";
import { authMiddleware } from "../../app/middlewares/auth";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const folder = req.body.folder || "grocery";

      if (!files || (Object.keys(files).length === 0)) {
        throw new BadRequestError("No files uploaded");
      }

      if (files["image"] && files["image"][0]) {
        const file = files["image"][0];
        const secureUrl = await uploadToCloudinary(file.buffer, folder);
        res.status(200).json({
          status: "success",
          data: {
            url: secureUrl,
          },
        });
        return;
      }

      if (files["images"] && files["images"].length > 0) {
        const uploadPromises = files["images"].map((file) =>
          uploadToCloudinary(file.buffer, folder)
        );
        const urls = await Promise.all(uploadPromises);
        res.status(200).json({
          status: "success",
          data: {
            urls,
          },
        });
        return;
      }

      throw new BadRequestError(
        "Please upload images using form-data fields: 'image' (single) or 'images' (multiple)"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
