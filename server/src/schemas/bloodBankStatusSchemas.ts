import { z } from "zod";

import {
  BloodGroup,
  BloodStockStatus,
} from "../types/enums";

// Create / Update Blood Bank Status Schema
export const upsertBloodBankStatusSchema = z.object({
  hospitalId: z
    .string()
    .uuid("Hospital ID must be a valid UUID"),

  bloodGroup: z.enum(
    Object.values(BloodGroup) as [
      BloodGroup,
      ...BloodGroup[]
    ]
  ),

  unitsAvailable: z
    .number()
    .int("Units available must be a whole number")
    .min(0, "Units available cannot be negative"),

  status: z.enum(
    Object.values(BloodStockStatus) as [
      BloodStockStatus,
      ...BloodStockStatus[]
    ]
  ),
});