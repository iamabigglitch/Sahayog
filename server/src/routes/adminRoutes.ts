import { Router } from "express";

import { authenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validationMiddleware";

import {
  getAdminDashboard,
  listAdminDonors,
  updateDonorVerification,
  listAdminBloodRequests,
  getAdminBloodRequest,
  updateAdminBloodRequestStatus,
  listAdminDonationCamps,
  getAdminDonationCamp,
  updateAdminDonationCampStatus,
  listAdminCampRsvps,
  updateAdminCampRsvpStatus,
} from "../controllers/adminController";

import {
  donorVerificationSchema,
  updateAdminRequestStatusSchema,
  updateAdminCampStatusSchema,
  updateAdminRsvpStatusSchema,
} from "../schemas/adminSchemas";

const router = Router();

// Every admin route needs a logged-in administrator
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Donors
router.get("/donors", listAdminDonors);
router.patch("/donors/:id/verification", validate(donorVerificationSchema), updateDonorVerification);

// Blood requests
router.get("/blood-requests", listAdminBloodRequests);
router.get("/blood-requests/:id", getAdminBloodRequest);
router.patch(
  "/blood-requests/:id/status",
  validate(updateAdminRequestStatusSchema),
  updateAdminBloodRequestStatus
);

// Donation camps
router.get("/donation-camps", listAdminDonationCamps);
router.get("/donation-camps/:id", getAdminDonationCamp);
router.patch(
  "/donation-camps/:id/status",
  validate(updateAdminCampStatusSchema),
  updateAdminDonationCampStatus
);

// Camp RSVPs / attendance
router.get("/donation-camps/:id/rsvps", listAdminCampRsvps);
router.patch("/rsvps/:id/status", validate(updateAdminRsvpStatusSchema), updateAdminCampRsvpStatus);

export default router;