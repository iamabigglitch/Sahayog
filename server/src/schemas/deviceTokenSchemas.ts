import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  token: z
    .string()
    .min(1, "Device token is required"),

  platform: z.enum([
    "android",
    "ios",
    "web",
  ]),
});

export const deleteDeviceTokenParamsSchema = z.object({
  tokenId: z
    .string()
    .uuid("Token ID must be a valid UUID"),
});