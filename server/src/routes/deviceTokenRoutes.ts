import { Router } from "express";

import {
  registerDeviceToken,
  deleteDeviceToken,
} from "../controllers/deviceTokenController";

import { authenticate } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

import { validate } from "../middleware/validationMiddleware";

import {
  registerDeviceTokenSchema,
  deleteDeviceTokenParamsSchema,
} from "../schemas/deviceTokenSchemas";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(registerDeviceTokenSchema),
  asyncHandler(registerDeviceToken)
);

router.delete(
  "/:tokenId",
  authenticate,
  validate(
    deleteDeviceTokenParamsSchema,
    "params"
  ),
  asyncHandler(deleteDeviceToken)
);

export default router;