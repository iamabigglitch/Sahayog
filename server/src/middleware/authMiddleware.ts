import { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/jwtUtil";
import { UserRole } from "../types/enums";
import { ApiError } from "../utils/apiError";

// Authenticate
// Verifies the JWT access token and attaches the user
// information to the request. Throws ApiError to be handled
// by the centralized error handler.
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authorization header is required"));
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new ApiError(401, "UNAUTHORIZED", "Invalid authorization header"));
    }

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired access token"));
  }
};

// Authorize
// Restricts an endpoint to specific user roles. Throws ApiError on failure.
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to access this resource"));
    }

    next();
  };
};