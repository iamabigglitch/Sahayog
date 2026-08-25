import { Router } from "express";

import {
  createRequestResponse,
  updateRequestResponseStatus,
} from "../controllers/requestResponseController";

import {
  validate,
} from "../middleware/validationMiddleware";

import {
  createRequestResponseSchema,
  updateRequestResponseSchema,
} from "../schemas/requestResponseSchemas";

import {
  authenticate,
} from "../middleware/authMiddleware";

import {
  authRateLimiter,
} from "../middleware/rateLimiterMiddleware";

const router = Router();


// Create a donor response
router.post(
  "/",
  authenticate,
  authRateLimiter,
  validate(createRequestResponseSchema),
  createRequestResponse
);


// Accept or decline an existing response
router.patch(
  "/:responseId",
  authenticate,
  validate(updateRequestResponseSchema),
  updateRequestResponseStatus
);


export default router;