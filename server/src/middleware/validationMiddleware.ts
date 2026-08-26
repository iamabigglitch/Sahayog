import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodSchema } from "zod";

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
    res: Response,
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
      if (error instanceof Error) {
        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });

        return;
      }

      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });
    }
  };
};

