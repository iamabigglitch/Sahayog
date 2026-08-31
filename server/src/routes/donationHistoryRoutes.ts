import {
  Router,
} from "express";

import {
  getMyDonationHistory,
  getDonationHistoryById,
  createDonationHistory,
  updateDonationStatus,
} from "../controllers/donationHistoryController";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  createDonationHistorySchema,
  updateDonationStatusSchema,
} from "../schemas/donationHistorySchemas";

import {
  authenticate,
  authorize,
} from "../middleware/authMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";

import {
  UserRole,
} from "../types/enums";


const router = Router();

// Donor Routes

// Get logged-in donor's donation history
router.get(
  "/me",
  authenticate,
  getMyDonationHistory
);


// Get one donation record belonging
// to the logged-in donor
router.get(
  "/:id",
  authenticate,
  getDonationHistoryById
);


// Admin Routes

// Create donation history
router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  authRateLimiter,
  validate(
    createDonationHistorySchema
  ),
  createDonationHistory
);


// Update donation status
router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.ADMIN),
  authRateLimiter,
  validate(
    updateDonationStatusSchema
  ),
  updateDonationStatus
);


export default router;