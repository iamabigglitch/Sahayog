import {
  Router,
} from "express";

import {
  getMyDonationHistory,
  getDonationHistoryById,
  createDonationHistory,
  completeAcceptedRequest,
  updateDonationStatus,
} from "../controllers/donationHistoryController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  createDonationHistorySchema,
  updateDonationStatusSchema,
} from "../schemas/donationHistorySchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/adminMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";


const router = Router();

// Donor Routes

// Get logged-in donor's donation history
router.get(
  "/me",
  authenticate,
  asyncHandler(getMyDonationHistory)
);


// Complete the accepted blood request for the authenticated donor.
router.post(
  "/requests/:requestId/complete",
  authenticate,
  asyncHandler(completeAcceptedRequest)
);

// Get one donation record belonging
// to the logged-in donor
router.get(
  "/:id",
  authenticate,
  asyncHandler(getDonationHistoryById)
);


// Admin Routes

// Create donation history
router.post(
  "/",
  authenticate,
  requireAdmin,
  authRateLimiter,
  validate(
    createDonationHistorySchema
  ),
  asyncHandler(createDonationHistory)
);


// Update donation status
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  authRateLimiter,
  validate(
    updateDonationStatusSchema
  ),
  asyncHandler(updateDonationStatus)
);


export default router;