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


const router = Router();


router.post(
  "/register",
  authRateLimiter,
  register
);


router.post(
  "/verify-otp",
  otpRateLimiter,
  verifyOtp
);


router.post(
  "/login",
  authRateLimiter,
  login
);


router.post(
  "/refresh",
  authRateLimiter,
  refresh
);


router.post(
  "/logout",
  authenticate,
  logout
);


export default router;