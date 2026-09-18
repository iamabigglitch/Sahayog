import crypto from "crypto";
import { Transaction } from "sequelize";

import sequelize from "../config/database";

import User from "../models/User";
import DonorProfile from "../models/DonorProfile";
import RefreshToken from "../models/RefreshToken";

import { OtpPurpose, JwtPayload } from "../types/authtypes";
import { BloodGroup, UserRole } from "../types/enums";

import OTPService from "./otpService";

import {
  hashPassword,
  comparePassword,
} from "../utils/passwordUtil";

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtil";


// Hash refresh token before storing it in the database
const hashRefreshToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};


// Get the expiry date from the refresh JWT
const getRefreshTokenExpiry = (token: string): Date => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid refresh token");
  }

  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8")
  );

  if (!payload.exp) {
    throw new Error("Refresh token expiry is missing");
  }

  return new Date(payload.exp * 1000);
};


// Create access token + refresh token pair
const createTokenPair = async (
  user: User,
  transaction?: Transaction
) => {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await RefreshToken.create(
    {
      user_id: user.id,
      token_hash: hashRefreshToken(refreshToken),
      expires_at: getRefreshTokenExpiry(refreshToken),
    },
    {
      transaction,
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};


export class AuthService {

  // REGISTER
  static async register(
    phone: string,
    password: string,
    bloodGroup: BloodGroup,
    cityId: string
  ) {
    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });

    if (existingUser) {
      throw new Error("Phone number is already registered");
    }

    /*
     * We intentionally do NOT create the User here.
     *
     * The client will send the password, blood group,
     * and city again during OTP verification.
     *
     * This avoids creating an unverified User row.
     */

    await OTPService.sendOtp(
      phone,
      OtpPurpose.REGISTRATION
    );

    return {
      message: "OTP sent successfully",
    };
  }

  // VERIFY REGISTRATION
  static async verifyRegistration(
    phone: string,
    otp: string,
    password: string,
    bloodGroup: BloodGroup,
    cityId: string
  ) {
    // Verify OTP first
    await OTPService.verifyOtp(
      phone,
      otp,
      OtpPurpose.REGISTRATION
    );

    // Make sure an account was not created
    // between registration and OTP verification
    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });

    if (existingUser) {
      throw new Error("Phone number is already registered");
    }

    // User + DonorProfile + RefreshToken
    // must either all succeed or all fail.
    const transaction = await sequelize.transaction();

    try {
      // Hash password before storing it
      const passwordHash = await hashPassword(password);

      // Create verified user
      const user = await User.create(
        {
          phone,
          password_hash: passwordHash,
          role: UserRole.DONOR,
          phone_verified: true,
        },
        {
          transaction,
        }
      );

      // Create donor profile
      await DonorProfile.create(
        {
          user_id: user.id,
          blood_group: bloodGroup,
          city_id: cityId,
        },
        {
          transaction,
        }
      );

      // Issue access + refresh tokens
      const tokens = await createTokenPair(
        user,
        transaction
      );

      await transaction.commit();

      // OTP is no longer usable
      await OTPService.expireOtp(
        phone,
        OtpPurpose.REGISTRATION
      );

      return {
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          phone_verified: user.phone_verified,
        },

        ...tokens,
      };

    } catch (error) {
      await transaction.rollback();

      throw error;
    }
  }

  // LOGIN
  static async login(
    phone: string,
    password: string
  ) {
    const user = await User.findOne({
      where: {
        phone,
      },
    });

    if (!user) {
      throw new Error("Invalid phone number or password");
    }

    // Compare supplied password with stored hash
    const passwordMatches = await comparePassword(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      throw new Error("Invalid phone number or password");
    }

    // Only verified accounts can log in

    if (!user.phone_verified) {
      throw new Error("Phone number is not verified");
    }

    // Create a new session
    const tokens = await createTokenPair(user);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        phone_verified: user.phone_verified,
      },

      ...tokens,
    };
  }

  // REFRESH TOKEN
  static async refresh(refreshToken: string) {
    // First verify JWT signature and expiry
    const payload = verifyRefreshToken(refreshToken);

    // Hash the supplied token so it can be
    // compared with the database value
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
        user_id: payload.userId,
      },
    });

    if (!storedToken) {
      throw new Error("Refresh token is invalid");
    }

    // Prevent reuse of a revoked token
    if (storedToken.revoked_at) {
      throw new Error("Refresh token has been revoked");
    }

    // Check database expiry as well
    if (storedToken.expires_at <= new Date()) {
      throw new Error("Refresh token has expired");
    }

    // Make sure the user still exists
    const user = await User.findByPk(
      payload.userId
    );

    if (!user) {
      throw new Error("User not found");
    }

    const transaction = await sequelize.transaction();

    try {
      // Revoke the old refresh token

      await storedToken.update(
        {
          revoked_at: new Date(),
        },
        {
          transaction,
        }
      );

      // Issue a new token pair
      const tokens = await createTokenPair(
        user,
        transaction
      );

      await transaction.commit();

      return tokens;

    } catch (error) {
      await transaction.rollback();

      throw error;
    }
  }

  // LOGOUT
  static async logout(refreshToken: string, userId: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
      },
    });

    // Logout is idempotent.
    // If the token does not exist, the user
    // is still considered logged out.
    if (!storedToken) {
      return {
        message: "Logged out successfully",
      };
    }

    // Only revoke the session that belongs to the authenticated user.
    // This prevents a caller from supplying another user's refresh token
    // and revoking their active session.
    if (storedToken.user_id !== userId) {
      throw new Error(
        "You are not authorized to revoke this session"
      );
    }

    // Revoke only if it has not already been revoked
    if (!storedToken.revoked_at) {
      await storedToken.update({
        revoked_at: new Date(),
      });
    }

    return {
      message: "Logged out successfully",
    };
  }
}