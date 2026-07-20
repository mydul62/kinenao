import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import appRouter from "./app/routes";
import { errorHandler } from "./app/middlewares/errorHandler";

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Payload parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard rate limiter for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// API Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Kinenao Backend API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// App level Routing registry
app.use("/api", appRouter);

// Catch-all route handler for undefined endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});

// Global Error handler
app.use(errorHandler);

export default app;
