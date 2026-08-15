import { Router } from "express";

import {
  createBloodRequest,
} from "../controllers/bloodRequestController";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  createBloodRequestSchema,
} from "../schemas/bloodRequestSchemas";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";


const router = Router();


router.post(
  "/",
  authRateLimiter,
  validate(createBloodRequestSchema),
  createBloodRequest
);


export default router;