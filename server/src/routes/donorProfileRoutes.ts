import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  getPublicProfile,
} from "../controllers/donorProfileController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  updateDonorProfileSchema,
  updateAvailabilitySchema,
} from "../schemas/donorProfileSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";


const router = Router();


router.get(
  "/me",
  authenticate,
  asyncHandler(getMyProfile)
);


router.patch(
  "/me",
  authenticate,
  authRateLimiter,
  validate(updateDonorProfileSchema),
  asyncHandler(updateMyProfile)
);


router.patch(
  "/me/availability",
  authenticate,
  authRateLimiter,
  validate(updateAvailabilitySchema),
  asyncHandler(updateAvailability)
);


router.get(
  "/:id/public",
  asyncHandler(getPublicProfile)
);


export default router;