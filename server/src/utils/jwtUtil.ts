import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types/authtypes";

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return secret;
};

const getAccessExpiry = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_ACCESS_EXPIRY || "15m") as SignOptions["expiresIn"];
};

const getRefreshExpiry = (): SignOptions["expiresIn"] => {
  return (process.env.JWT_REFRESH_EXPIRY || "7d") as SignOptions["expiresIn"];
};

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: getAccessExpiry(),
  });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: getRefreshExpiry(),
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, getAccessSecret()) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, getRefreshSecret()) as JwtPayload;
};