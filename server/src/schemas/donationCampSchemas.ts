import { z } from "zod";

import {
  CampStatus,
  OrganizerType,
} from "../types/enums";

// Create Donation Camp Schema (admin)
export const createDonationCampSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must not exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional(),

  venue: z
    .string()
    .trim()
    .min(2, "Venue must be at least 2 characters"),

  cityId: z
    .string()
    .uuid("City ID must be a valid UUID"),

  hospitalId: z
    .string()
    .uuid("Hospital ID must be a valid UUID")
    .optional(),

  organizerName: z
    .string()
    .trim()
    .min(2, "Organizer name must be at least 2 characters")
    .max(150, "Organizer name must not exceed 150 characters"),

  organizerType: z.enum(
    Object.values(OrganizerType) as [
      OrganizerType,
      ...OrganizerType[]
    ]
  ),

  campDate: z
    .string()
    .date("Camp date must be a valid date"),

  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "Start time must be in HH:MM format"
    ),

  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):[0-5]\d$/,
      "End time must be in HH:MM format"
    ),
});

// Update Donation Camp Schema (admin)
export const updateDonationCampSchema =
  createDonationCampSchema.partial();

// Update Camp Status Schema (admin)
export const updateCampStatusSchema = z.object({
  status: z.enum(
    Object.values(CampStatus) as [
      CampStatus,
      ...CampStatus[]
    ]
  ),
});