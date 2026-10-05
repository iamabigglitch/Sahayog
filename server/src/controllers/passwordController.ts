import { Request, Response } from "express";

import { PasswordService } from "../services/passwordService";

const messageOf = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await PasswordService.forgotPassword(req.body.phone);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: {
        code: "FORGOT_PASSWORD_FAILED",
        message: messageOf(error, "Could not send a verification code"),
      },
    });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, newPassword } = req.body;

    const result = await PasswordService.resetPassword(phone, otp, newPassword);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: {
        code: "RESET_PASSWORD_FAILED",
        message: messageOf(error, "Could not reset the password"),
      },
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const { currentPassword, newPassword, refreshToken } = req.body;

    const result = await PasswordService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword,
      refreshToken
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: {
        code: "CHANGE_PASSWORD_FAILED",
        message: messageOf(error, "Could not change the password"),
      },
    });
  }
};