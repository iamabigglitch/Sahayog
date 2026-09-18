import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

import {
  rsvpToDonationCamp,
  cancelDonationCampRsvp,
  getMyDonationCampRsvps,
} from "../controllers/campRSVPController";

const router = Router();

// Get current donor's RSVPs
router.get(
  "/my",
  authenticate,
  asyncHandler(getMyDonationCampRsvps)
);

// RSVP to a donation camp
router.post(
  "/:id/rsvp",
  authenticate,
  asyncHandler(rsvpToDonationCamp)
);

// Cancel RSVP
router.patch(
  "/:id/rsvp/cancel",
  authenticate,
  asyncHandler(cancelDonationCampRsvp)
);

export default router;