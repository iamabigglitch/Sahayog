import { Router } from "express";

import {
  registerDeviceToken,
  deleteDeviceToken,
} from "../controllers/deviceTokenController";

import { authenticate } from "../middleware/authMiddleware";

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
  registerDeviceToken
);

router.delete(
  "/:tokenId",
  authenticate,
  validate(
    deleteDeviceTokenParamsSchema,
    "params"
  ),
  deleteDeviceToken
);

export default router;