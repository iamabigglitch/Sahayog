import { Router } from "express";

import {
  getDonorMatches,
} from "../controllers/donorMatchingController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  donorMatchingParamsSchema,
} from "../schemas/donorMatchingSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/:requestId/matches",
  authenticate,
  validate(
    donorMatchingParamsSchema,
    "params"
  ),
  asyncHandler(getDonorMatches)
);

export default router;
