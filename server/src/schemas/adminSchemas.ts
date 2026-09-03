import { z } from "zod";
import { RequestStatus, RSVPStatus } from "../types/enums";

export const donorVerificationSchema = z.object({
  verified: z.boolean(),
});

export const updateAdminRequestStatusSchema = z.object({
  status: z.enum(
    Object.values(RequestStatus) as [
      RequestStatus,
      ...RequestStatus[]
    ]
  ),
});

export const updateAdminRsvpStatusSchema = z.object({
  status: z.enum(
    Object.values(RSVPStatus) as [
      RSVPStatus,
      ...RSVPStatus[]
    ]
  ),
});

export const adminRequestFilterSchema = z.object({
  status: z
    .enum(
      Object.values(RequestStatus) as [
        RequestStatus,
        ...RequestStatus[]
      ]
    )
    .optional(),

  urgency: z.string().optional(),

  cityId: z
    .string()
    .uuid("City ID must be a valid UUID")
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const adminDonorFilterSchema = z.object({
  verified: z
    .enum(["true", "false"])
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});