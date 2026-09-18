import { Router } from "express";

import {
  upsertBloodBankStatus,
  getAllBloodBankStatuses,
  getHospitalBloodBankStatuses,
  getHospitalBloodGroupStatus,
} from "../controllers/bloodBankStatusController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  upsertBloodBankStatusSchema,
} from "../schemas/bloodBankStatusSchemas";

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


// Public: Get all blood bank statuses

router.get(
  "/",
  asyncHandler(getAllBloodBankStatuses)
);


// Public: Get statuses for one hospital

router.get(
  "/hospital/:hospitalId",
  asyncHandler(getHospitalBloodBankStatuses)
);


// Public: Get one blood group status

router.get(
  "/hospital/:hospitalId/:bloodGroup",
  asyncHandler(getHospitalBloodGroupStatus)
);


// Admin: Create or update status

router.patch(
  "/",
  authenticate,
  requireAdmin,
  authRateLimiter,
  validate(upsertBloodBankStatusSchema),
  upsertBloodBankStatus
);


export default router;