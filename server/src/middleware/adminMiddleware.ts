import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { UserRole } from "../types/enums";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        error: {
          code: "ADMIN_ACCESS_REQUIRED",
          message: "Only administrators can access this resource",
        },
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: {
        code: "ADMIN_AUTHORIZATION_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify administrator access",
      },
    });
  }
};