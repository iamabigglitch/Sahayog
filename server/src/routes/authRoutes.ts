import { Router } from "express";

import {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/authController";

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
  register
);



router.post(
  "/verify-otp",
  otpRateLimiter,
  validate(verifyOtpSchema),
  verifyOtp
);



router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);



router.post(
  "/refresh",
  authRateLimiter,
  validate(refreshSchema),
  refresh
);



router.post(
  "/logout",
  authenticate,
  validate(logoutSchema),
  logout
);



export default router;