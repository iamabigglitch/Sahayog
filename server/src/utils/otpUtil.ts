import crypto from "crypto";

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = (otp: string): string => {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error("OTP_SECRET is not configured");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
};