import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";


export const validate = (schema: ZodSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        });
      }

      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
        },
      });
    }
  };
};