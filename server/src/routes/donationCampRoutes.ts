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

import {
  createDonationCampSchema,
  updateDonationCampSchema,
  updateCampStatusSchema,
} from "../schemas/donationCampSchemas";

const router = Router();

// Public routes
router.get("/", listDonationCamps);
router.get("/:id", getDonationCamp);

// Admin routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate(createDonationCampSchema),
  createDonationCamp
);

router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateDonationCampSchema),
  updateDonationCamp
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(updateCampStatusSchema),
  updateDonationCampStatus
);

export default router;