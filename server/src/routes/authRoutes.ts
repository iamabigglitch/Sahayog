import { Router } from "express";

import {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";

import {
  authRateLimiter,
  otpRateLimiter,
} from "../middleware/rateLimiterMiddleware";


import { authenticate } from "../middleware/authMiddleware";
import { validate } from "../middleware/validationMiddleware";


import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from "../schemas/authSchemas";



const router = Router();



router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(register)
);



router.post(
  "/verify-otp",
  otpRateLimiter,
  validate(verifyOtpSchema),
  asyncHandler(verifyOtp)
);



router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(login)
);



router.post(
  "/refresh",
  authRateLimiter,
  validate(refreshSchema),
  asyncHandler(refresh)
);



router.post(
  "/logout",
  authenticate,
  validate(logoutSchema),
  asyncHandler(logout)
);



export default router;