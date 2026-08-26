import { Router } from "express";

import {
  getDonorMatches,
} from "../controllers/donorMatchingController";

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
  getDonorMatches
);

export default router;
