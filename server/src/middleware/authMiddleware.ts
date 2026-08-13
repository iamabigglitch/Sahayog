import { Request, Response, NextFunction } from "express";

import {
  verifyAccessToken,
} from "../utils/jwtUtil";

import { UserRole } from "../types/enums";


// Authenticate
// Verifies the JWT access token and attaches the user
// information to the request.

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {

  try {

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authorization header is required",
        },
      });

      return;
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid authorization header",
        },
      });

      return;
    }

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();

  } catch (error) {

    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token",
      },
    });

  }
};


// Authorize
// Restricts an endpoint to specific user roles.

export const authorize = (
  ...allowedRoles: UserRole[]
) => {

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        },
      });

      return;
    }

    next();
  };
};