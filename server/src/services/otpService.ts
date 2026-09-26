import { timingSafeEqual } from "crypto";

import OtpVerification from "../models/OtpVerification";
import { OtpPurpose } from "../types/authtypes";
import { generateOtp, hashOtp } from "../utils/otpUtil";

class OTPService {
  private readonly otpExpiryMinutes: number;
  private readonly maxAttempts = 5;

  constructor() {
    this.otpExpiryMinutes = Number(
      process.env.OTP_EXPIRY_MINUTES || 5
    );
  }

  // Send a new OTP
  async sendOtp(
    phone: string,
    purpose: OtpPurpose
  ): Promise<void> {
    const existingOtp = await OtpVerification.findOne({
      where: {
        phone,
        purpose,
      },
      order: [["created_at", "DESC"]],
    });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(
      Date.now() + this.otpExpiryMinutes * 60 * 1000
    );

    if (existingOtp) {
      existingOtp.setDataValue("otp_hash", otpHash);
      existingOtp.setDataValue("expires_at", expiresAt);
      existingOtp.setDataValue("attempts", 0);
      existingOtp.setDataValue("verified_at", null);
      await existingOtp.save();
    } else {
      await OtpVerification.create({
        phone,
        otp_hash: otpHash,
        purpose,
        expires_at: expiresAt,
        attempts: 0,
      });
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV OTP] ${purpose} OTP for ${phone}: ${otp}`
      );
    }

    // TODO:
    // Production SMS delivery will be added here.
  }

  // Verify an OTP
  async verifyOtp(
    phone: string,
    code: string,
    purpose: OtpPurpose
  ): Promise<boolean> {
    const otpRecord = await OtpVerification.findOne({
      where: {
        phone,
        purpose,
        verified_at: null,
      },
      order: [["created_at", "DESC"]],
    });

    if (!otpRecord) {
      throw new Error("No active OTP found");
    }

    const expiresAt = otpRecord.getDataValue("expires_at");
    const otpHash = otpRecord.getDataValue("otp_hash");
    const attempts = otpRecord.getDataValue("attempts") ?? 0;

    if (!(expiresAt instanceof Date) && expiresAt) {
      // Sequelize may return a string/date-like value depending on driver state.
      // Normalize it to a Date before comparison.
      const parsedExpiresAt = new Date(expiresAt);
      otpRecord.setDataValue("expires_at", parsedExpiresAt);
      // Re-read the normalized value for consistent comparisons.
      const normalizedExpiresAt = otpRecord.getDataValue("expires_at");
      if (!(normalizedExpiresAt instanceof Date) || Number.isNaN(normalizedExpiresAt.getTime())) {
        throw new Error("OTP expiry is invalid");
      }
      if (normalizedExpiresAt.getTime() < Date.now()) {
        throw new Error("OTP has expired");
      }
    } else if (!(expiresAt instanceof Date) || Number.isNaN(expiresAt.getTime())) {
      throw new Error("OTP expiry is invalid");
    } else if (expiresAt.getTime() < Date.now()) {
      throw new Error("OTP has expired");
    }

    if (attempts >= this.maxAttempts) {
      throw new Error("Maximum OTP attempts exceeded");
    }

    otpRecord.setDataValue("attempts", attempts + 1);
    await otpRecord.save();

    // In development accept any 6-digit code to avoid SMS dependency.
    if (process.env.NODE_ENV === "development") {
      otpRecord.setDataValue("verified_at", new Date());
      await otpRecord.save();
      return true;
    }

    const submittedHash = hashOtp(code);
    const isValid = this.safeCompare(
      submittedHash,
      otpHash
    );

    if (!isValid) {
      throw new Error("Invalid OTP");
    }

    otpRecord.setDataValue("verified_at", new Date());
    await otpRecord.save();

    return true;
  }

  // Manually invalidate an OTP
  async expireOtp(
    phone: string,
    purpose: OtpPurpose
  ): Promise<void> {
    await OtpVerification.update(
      {
        verified_at: new Date(),
      },
      {
        where: {
          phone,
          purpose,
          verified_at: null,
        },
      }
    );
  }

  // Timing-safe hash comparison
  private safeCompare(
  first: string,
  second: string
    ): boolean {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
    }
    }

export default new OTPService();