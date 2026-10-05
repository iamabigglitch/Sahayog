import crypto from "crypto";
import { Op } from "sequelize";

import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

import { OtpPurpose } from "../types/authtypes";
import { hashPassword, comparePassword } from "../utils/passwordUtil";

import OTPService from "./otpService";

// Same hashing the auth service uses when it stores refresh tokens
const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

export class PasswordService {
  // Sign a user out everywhere, optionally keeping one session
  private static async revokeSessions(userId: string, keepRefreshToken?: string) {
    await RefreshToken.update(
      { revoked_at: new Date() },
      {
        where: {
          user_id: userId,
          revoked_at: null,
          ...(keepRefreshToken
            ? { token_hash: { [Op.ne]: hashRefreshToken(keepRefreshToken) } }
            : {}),
        },
      }
    );
  }

  // FORGOT PASSWORD, step 1: send a code.
  // The answer is the same whether or not the number has an account,
  // so this can't be used to find out who is registered.
  static async forgotPassword(phone: string) {
    const message = "If an account exists for this number, a verification code has been sent.";

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return { message };
    }

    const otp = await OTPService.sendOtp(phone, OtpPurpose.PASSWORD_RESET);

    return {
      message,
      ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
    };
  }

  // FORGOT PASSWORD, step 2: check the code and set the new password
  static async resetPassword(phone: string, otp: string, newPassword: string) {
    await OTPService.verifyOtp(phone, otp, OtpPurpose.PASSWORD_RESET);

    const user = await User.findOne({ where: { phone } });

    if (!user) {
      throw new Error("Account not found");
    }

    await user.update({ password_hash: await hashPassword(newPassword) });

    // Anyone using the old password is signed out
    await this.revokeSessions(user.getDataValue("id"));

    return { message: "Password reset successfully. You can now log in." };
  }

  // CHANGE PASSWORD (logged in)
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentRefreshToken?: string
  ) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const matches = await comparePassword(currentPassword, user.getDataValue("password_hash"));

    if (!matches) {
      throw new Error("Current password is incorrect");
    }

    if (currentPassword === newPassword) {
      throw new Error("New password must be different from the current password");
    }

    await user.update({ password_hash: await hashPassword(newPassword) });

    // Other devices are signed out; this one stays signed in
    await this.revokeSessions(userId, currentRefreshToken);

    return { message: "Password changed successfully." };
  }
}