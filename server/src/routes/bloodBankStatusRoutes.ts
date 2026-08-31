import { Router } from "express";

import {
  upsertBloodBankStatus,
  getAllBloodBankStatuses,
  getHospitalBloodBankStatuses,
  getHospitalBloodGroupStatus,
} from "../controllers/bloodBankStatusController";

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
  authorize,
} from "../middleware/authMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";

const router = Router();


// Public: Get all blood bank statuses

router.get(
  "/",
  getAllBloodBankStatuses
);


// Public: Get statuses for one hospital

router.get(
  "/hospital/:hospitalId",
  getHospitalBloodBankStatuses
);


// Public: Get one blood group status

router.get(
  "/hospital/:hospitalId/:bloodGroup",
  getHospitalBloodGroupStatus
);


// Admin: Create or update status

router.patch(
  "/",
  authenticate,
  authorize("admin" as any),
  authRateLimiter,
  validate(upsertBloodBankStatusSchema),
  upsertBloodBankStatus
);


export default router;