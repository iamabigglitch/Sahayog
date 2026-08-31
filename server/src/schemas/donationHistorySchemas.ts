import { z } from "zod";

import {
  DonationStatus,
} from "../types/enums";

// Create Donation History
export const createDonationHistorySchema =
  z.object({
    donorId: z
      .string()
      .uuid("Donor ID must be a valid UUID"),

    requestId: z
      .string()
      .uuid("Request ID must be a valid UUID"),

    status: z.enum(
      Object.values(DonationStatus) as [
        DonationStatus,
        ...DonationStatus[]
      ]
    ),

    donationDate: z
      .string()
      .date(
        "Donation date must be a valid date"
      ),
  });

// Update Donation Status
export const updateDonationStatusSchema =
  z.object({
    status: z.enum(
      Object.values(DonationStatus) as [
        DonationStatus,
        ...DonationStatus[]
      ]
    ),
  });