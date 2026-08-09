import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB image limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!") as any, false);
    }
  },
});

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60MB video limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/octet-stream" ||
      file.originalname.match(/\.(mp4|webm|mov|m4v|mkv)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only video files (MP4, WebM, MOV) are allowed!") as any, false);
    }
  },
});

// Helper function to upload image buffers directly to Cloudinary
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "kinenao"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result?.secure_url || "");
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper function to upload video buffers directly to Cloudinary
export const uploadVideoToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "kinenao/videos"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "video",
        chunk_size: 6000000,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result?.secure_url || "");
      }
    );
    uploadStream.end(fileBuffer);
  });
};
