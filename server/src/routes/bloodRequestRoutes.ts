import { Router } from "express";

import {
  createBloodRequest,
} from "../controllers/bloodRequestController";
import { asyncHandler } from "../utils/asyncHandler";

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

// Emergency requester flow is intentionally public. Requesters can submit
// urgent blood requests without an account; donor and admin flows remain
// authenticated and protected by ownership/admin checks elsewhere.
router.post(
  "/",
  authRateLimiter,
  validate(createBloodRequestSchema),
  asyncHandler(createBloodRequest)
);


export default router;