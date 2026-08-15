import { z } from "zod";

import {
  BloodGroup,
  Urgency,
  RelationshipToPatient,
} from "../types/enums";

// Create Blood Request Schema
export const createBloodRequestSchema = z.object({
  bloodGroupNeeded: z.enum(
    Object.values(BloodGroup) as [
      BloodGroup,
      ...BloodGroup[]
    ]
  ),

  unitsNeeded: z
    .number()
    .int("Units needed must be a whole number")
    .min(1, "At least 1 unit of blood is required"),

  hospitalId: z
    .string()
    .uuid("Hospital ID must be a valid UUID"),

  cityId: z
    .string()
    .uuid("City ID must be a valid UUID"),

  requesterName: z
    .string()
    .trim()
    .min(
      2,
      "Requester name must be at least 2 characters"
    )
    .max(
      100,
      "Requester name must not exceed 100 characters"
    ),

  contactPhone: z
    .string()
    .trim()
    .min(7, "Contact phone number is invalid")
    .max(20, "Contact phone number is invalid"),

  relationshipToPatient: z.enum(
    Object.values(RelationshipToPatient) as [
      RelationshipToPatient,
      ...RelationshipToPatient[]
    ]
  ),

  urgency: z
    .enum(
      Object.values(Urgency) as [
        Urgency,
        ...Urgency[]
      ]
    )
    .default(Urgency.NORMAL),
});