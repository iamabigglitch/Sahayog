import { Router } from "express";

import {
  upsertBloodBankStatus,
  getAllBloodBankStatuses,
  getHospitalBloodBankStatuses,
  getHospitalBloodGroupStatus,
} from "../controllers/bloodBankStatusController";

import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validationMiddleware";
import { upsertBloodBankStatusSchema } from "../schemas/bloodBankStatusSchemas";
import { authenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";

const router = Router();

// Public
router.get("/", asyncHandler(getAllBloodBankStatuses));
router.get("/hospital/:hospitalId", asyncHandler(getHospitalBloodBankStatuses));
router.get("/hospital/:hospitalId/:bloodGroup", asyncHandler(getHospitalBloodGroupStatus));

// Admin: create or update one blood group's status
router.patch(
  "/",
  authenticate,
  requireAdmin,
  validate(upsertBloodBankStatusSchema),
  upsertBloodBankStatus
);

export default router;