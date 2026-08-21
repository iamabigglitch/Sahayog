import { z } from "zod";

export const createRequestResponseSchema = z.object({
  requestId: z
    .string()
    .uuid("Request ID must be a valid UUID"),

  donorId: z
    .string()
    .uuid("Donor ID must be a valid UUID"),
});