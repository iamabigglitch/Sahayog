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
    // Invalidate any previous unverified OTP
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

    // Generate a new OTP
    const otp = generateOtp();

    // Hash the OTP before storing it
    const otpHash = hashOtp(otp);

    // Calculate expiry time
    const expiresAt = new Date(
      Date.now() + this.otpExpiryMinutes * 60 * 1000
    );

    // Store the OTP verification record
    await OtpVerification.create({
      phone,
      otp_hash: otpHash,
      purpose,
      expires_at: expiresAt,
      attempts: 0,
    });

    // Development delivery
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

    // Check expiry
    if (otpRecord.expires_at.getTime() < Date.now()) {
      throw new Error("OTP has expired");
    }

    // Check maximum attempts
    if (otpRecord.attempts >= this.maxAttempts) {
      throw new Error("Maximum OTP attempts exceeded");
    }

    // Count this verification attempt
    otpRecord.attempts += 1;
    await otpRecord.save();

    // Hash the submitted OTP
    const submittedHash = hashOtp(code);

    // Compare hashes using timing-safe comparison
    const isValid = this.safeCompare(
      submittedHash,
      otpRecord.otp_hash
    );

    if (!isValid) {
      throw new Error("Invalid OTP");
    }

    // Mark OTP as successfully verified
    otpRecord.verified_at = new Date();
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