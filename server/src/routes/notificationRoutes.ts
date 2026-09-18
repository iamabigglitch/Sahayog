import { Router } from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  notificationParamsSchema,
} from "../schemas/notificationSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = Router();

// Get authenticated user's notifications
router.get(
  "/",
  authenticate,
  asyncHandler(getMyNotifications)
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
