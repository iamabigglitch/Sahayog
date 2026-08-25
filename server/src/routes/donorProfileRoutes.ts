import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  getPublicProfile,
} from "../controllers/donorProfileController";

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
  getMyProfile
);


router.patch(
  "/me",
  authenticate,
  authRateLimiter,
  validate(updateDonorProfileSchema),
  updateMyProfile
);


router.patch(
  "/me/availability",
  authenticate,
  authRateLimiter,
  validate(updateAvailabilitySchema),
  updateAvailability
);


router.get(
  "/:id/public",
  getPublicProfile
);


export default router;