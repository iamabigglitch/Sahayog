import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";

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
  getMyDonationCampRsvps
);

// RSVP to a donation camp
router.post(
  "/:id/rsvp",
  authenticate,
  rsvpToDonationCamp
);

// Cancel RSVP
router.patch(
  "/:id/rsvp/cancel",
  authenticate,
  cancelDonationCampRsvp
);

export default router;