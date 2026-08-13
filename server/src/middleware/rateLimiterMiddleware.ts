import rateLimit from "express-rate-limit";


// General authentication rate limiter
// Protects authentication endpoints from excessive requests.

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication requests. Please try again later.",
    },
  },
});


// OTP rate limiter
// OTP requests need stricter protection because they can trigger
// repeated SMS/email delivery in a real production environment.

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    error: {
      code: "OTP_RATE_LIMIT_EXCEEDED",
      message: "Too many OTP requests. Please try again later.",
    },
  },
});