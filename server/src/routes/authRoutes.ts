import { Router } from "express";

import {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/authController";

import {
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/passwordController";

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
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
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


// Password: forgot (sends a code), reset (uses the code), change (logged in)

router.post(
  "/forgot-password",
  otpRateLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPassword)
);

router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.post(
  "/change-password",
  authenticate,
  authRateLimiter,
  validate(changePasswordSchema),
  asyncHandler(changePassword)
);


export default router;