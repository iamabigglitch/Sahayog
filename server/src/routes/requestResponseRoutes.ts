import { Router } from "express";

import {
  createRequestResponse,
} from "../controllers/requestResponseController";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  createRequestResponseSchema,
} from "../schemas/requestResponseSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";


const router = Router();


router.post(
  "/",
  authenticate,
  authRateLimiter,
  validate(createRequestResponseSchema),
  createRequestResponse
);


export default router;