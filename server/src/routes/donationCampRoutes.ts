import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validationMiddleware";

import {
  createDonationCamp,
  updateDonationCamp,
  updateDonationCampStatus,
  listDonationCamps,
  getDonationCamp,
} from "../controllers/donationCampController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  createDonationCampSchema,
  updateDonationCampSchema,
  updateCampStatusSchema,
} from "../schemas/donationCampSchemas";

const router = Router();

// Public routes
router.get("/", asyncHandler(listDonationCamps));
router.get("/:id", asyncHandler(getDonationCamp));

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createDonationCampSchema),
  asyncHandler(createDonationCamp)
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateDonationCampSchema),
  asyncHandler(updateDonationCamp)
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateCampStatusSchema),
  asyncHandler(updateDonationCampStatus)
);

export default router;