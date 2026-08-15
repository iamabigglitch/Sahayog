import { z } from "zod";

import { BloodGroup } from "../types/enums";


// Phone number validation
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must not exceed 15 digits")
  .regex(
    /^\+?[0-9]+$/,
    "Phone number must contain only digits and may start with +"
  );


// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters");


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

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),

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