import { z } from "zod";

// Create Hospital Schema (admin)
export const createHospitalSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(150),
  cityId: z.string().uuid("City ID must be a valid UUID"),
  address: z.string().trim().min(2, "Address must be at least 2 characters"),
  contactPhone: z.string().trim().min(5, "Contact phone must be at least 5 characters"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});