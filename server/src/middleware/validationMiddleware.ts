import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodSchema, ZodError } from "zod";

type ValidationTarget =
  | "body"
  | "params"
  | "query";

export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = "body"
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    try {
      const parsedData = schema.parse(
        req[target]
      );

      if (target === "body") {
        req.body = parsedData;
      }

      if (target === "params") {
        Object.assign(req.params, parsedData);
      }

      if (target === "query") {
        Object.assign(req.query, parsedData);
      }

      next();
    } catch (error) {
      // Delegate error handling to centralized error handler
      next(error);
    }
  };
};