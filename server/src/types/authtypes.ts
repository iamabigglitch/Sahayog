import { UserRole } from "./enums";

export enum OtpPurpose {
  REGISTRATION = "registration",
  LOGIN = "login",
  PASSWORD_RESET = "password_reset",
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}