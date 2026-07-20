import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || undefined;

  // Log non-operational errors for debugging
  if (process.env.NODE_ENV === "development" || !err.isOperational) {
    console.error("Error Logged:", err);
  }

  // Handle unique constraints database errors (Prisma)
  if (err.code === "P2002") {
    statusCode = 409;
    const targets = err.meta?.target || "field";
    message = `Duplicate value for unique constraint on: ${targets}`;
  }

  // Handle Prisma record not found
  if (err.code === "P2025") {
    statusCode = 404;
    message = err.meta?.cause || "Record not found";
  }

  res.status(statusCode).json({
    status: err.status || "error",
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
