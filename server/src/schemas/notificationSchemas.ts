import { z } from "zod";

import { BloodGroup } from "../types/enums";

export const notificationParamsSchema =
  z.object({
    notificationId: z
      .string()
      .uuid(
        "Notification ID must be a valid UUID"
      ),
  });

// Admin announcement. City and blood group are optional filters;
// leaving both out sends it to every donor.
export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters"),

  message: z
    .string()
    .trim()
    .min(2, "Message must be at least 2 characters")
    .max(500, "Message must not exceed 500 characters"),

  cityId: z
    .string()
    .uuid("City ID must be a valid UUID")
    .optional(),

  bloodGroup: z
    .enum(
      Object.values(BloodGroup) as [
        BloodGroup,
        ...BloodGroup[]
      ]
    )
    .optional(),
});