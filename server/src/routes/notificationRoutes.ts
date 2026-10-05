import { Router } from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  createAnnouncement,
} from "../controllers/notificationController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  notificationParamsSchema,
  createAnnouncementSchema,
} from "../schemas/notificationSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  requireAdmin,
} from "../middleware/adminMiddleware";

const router = Router();

// Get authenticated user's notifications
router.get(
  "/",
  authenticate,
  asyncHandler(getMyNotifications)
);

// Admin: send an announcement to donors
router.post(
  "/announcements",
  authenticate,
  requireAdmin,
  validate(createAnnouncementSchema),
  asyncHandler(createAnnouncement)
);

// Mark notification as read
router.patch(
  "/:notificationId/read",
  authenticate,
  validate(
    notificationParamsSchema,
    "params"
  ),
  asyncHandler(markNotificationAsRead)
);

export default router;