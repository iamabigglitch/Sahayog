import { z } from "zod";

import { BloodGroup } from "../types/enums";


// Phone number validation: Nepali mobile numbers are exactly 10 digits
const phoneSchema = z
  .string()
  .trim()
  .length(10, "Phone number must be exactly 10 digits")
  .regex(/^[0-9]{10}$/, "Phone number must contain only digits");

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters");

// One-time code validation
const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d+$/, "OTP must contain only digits");


// Registration
export const registerSchema = z.object({
  phone: phoneSchema,

  password: passwordSchema,

  bloodGroup: z.enum(
    Object.values(BloodGroup) as [
      string,
      ...string[]
    ]
  ),

  cityId: z.string().uuid("Invalid city ID"),
});


// Registration OTP verification
export const verifyOtpSchema = z.object({
  phone: phoneSchema,

  otp: otpSchema,

  password: passwordSchema,

  bloodGroup: z.enum(
    Object.values(BloodGroup) as [
      string,
      ...string[]
    ]
  ),

  cityId: z.string().uuid("Invalid city ID"),
});


// Login
export const loginSchema = z.object({
  phone: phoneSchema,

  password: passwordSchema,
});


// Refresh token
export const refreshSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});


// Logout
export const logoutSchema = z.object({
  refreshToken: z
    .string()
    .min(1, "Refresh token is required"),
});


// Forgot password: ask for a code
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});


// Forgot password: use the code to set a new password
export const resetPasswordSchema = z.object({
  phone: phoneSchema,

  otp: otpSchema,

  newPassword: passwordSchema,
});


// Change password while logged in.
// refreshToken is the current session, which stays signed in.
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: passwordSchema,

  refreshToken: z.string().min(1).optional(),
});