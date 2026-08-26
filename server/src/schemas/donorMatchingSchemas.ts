import { z } from "zod";

export const donorMatchingParamsSchema = z.object({
  requestId: z
    .string()
    .uuid("Request ID must be a valid UUID"),
});