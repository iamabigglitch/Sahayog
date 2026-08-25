import { z } from "zod";

import {
  BloodGroup,
} from "../types/enums";


// Update Donor Profile Schema

// Only fields a donor should be able to change themselves.
// donor_verified and trust_score are intentionally absent.
// These are admin-controlled fields.

export const updateDonorProfileSchema = z
  .object({

    bloodGroup: z
      .enum(
        Object.values(BloodGroup) as [
          BloodGroup,
          ...BloodGroup[]
        ]
      )
      .optional(),

    cityId: z
      .string()
      .uuid("City ID must be a valid UUID")
      .optional(),

    latitude: z
      .number()
      .min(
        -90,
        "Latitude must be between -90 and 90"
      )
      .max(
        90,
        "Latitude must be between -90 and 90"
      )
      .optional(),

    longitude: z
      .number()
      .min(
        -180,
        "Longitude must be between -180 and 180"
      )
      .max(
        180,
        "Longitude must be between -180 and 180"
      )
      .optional(),

    lastDonationDate: z
      .string()
      .date(
        "Last donation date must be a valid date"
      )
      .optional(),

  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "At least one profile field must be provided",
    }
  );


// Update Availability Schema

export const updateAvailabilitySchema = z.object({

  available: z.boolean(),

});