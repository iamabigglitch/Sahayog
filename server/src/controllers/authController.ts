import { Request, Response } from "express";

import { AuthService } from "../services/authService";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      phone,
      password,
      bloodGroup,
      cityId,
    } = req.body;

    const result = await AuthService.register(
      phone,
      password,
      bloodGroup,
      cityId
    );

    res.status(202).json(result);
  } catch (error) {
    res.status(400).json({
      error: {
        code: "REGISTRATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Registration failed",
      },
    });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      phone,
      otp,
      password,
      bloodGroup,
      cityId,
    } = req.body;

    const result =
      await AuthService.verifyRegistration(
        phone,
        otp,
        password,
        bloodGroup,
        cityId
      );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: {
        code: "OTP_VERIFICATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "OTP verification failed",
      },
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      phone,
      password,
    } = req.body;

    const result = await AuthService.login(
      phone,
      password
    );

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    const statusCode =
      error instanceof Error && error.message === "Invalid phone number or password"
        ? 401
        : 400;

    res.status(statusCode).json({
      error: {
        code: "LOGIN_FAILED",
        message,
      },
    });
  }
};

export const refresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const result =
      await AuthService.refresh(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      error: {
        code: "REFRESH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Refresh token is invalid",
      },
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const { refreshToken } = req.body;

    const result =
      await AuthService.logout(
        refreshToken,
        req.user.userId
      );

    res.status(200).json(result);
  } catch (error) {
    const status =
      error instanceof Error &&
      error.message ===
        "You are not authorized to revoke this session"
        ? 403
        : 400;

    res.status(status).json({
      error: {
        code: status === 403 ? "FORBIDDEN" : "LOGOUT_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Logout failed",
      },
    });
  }
};