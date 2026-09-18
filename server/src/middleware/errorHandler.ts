import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => i.message).join(", ");
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    });
    return;
  }

  // Known ApiError instances
  if (err instanceof ApiError) {
    const { statusCode, code, message, details } = err;
    const payload: any = {
      error: {
        code,
        message,
      },
    };

    // Attach limited details for debugging in non-production only
    if (details && process.env.NODE_ENV !== "production") {
      payload.error.details = details;
    }

    res.status(statusCode).json(payload);
    return;
  }

  // Sequelize errors and other known DB errors: hide internal details
  // Detect by name since Sequelize classes may not be available here
  if (err instanceof Error && /Sequelize/.test(err.name)) {
    res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "A database error occurred",
      },
    });
    return;
  }

  // Generic fallback
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
