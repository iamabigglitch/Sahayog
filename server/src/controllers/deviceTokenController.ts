import {
  Request,
  Response,
} from "express";

import {
  DeviceTokenService,
} from "../services/deviceTokenService";

export const registerDeviceToken =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required",
          },
        });

        return;
      }

      const {
        token,
        platform,
      } = req.body;

      const deviceToken =
        await DeviceTokenService.registerDeviceToken(
          {
            userId: req.user.userId,
            token,
            platform,
          }
        );

      res.status(200).json({
        message:
          "Device token registered successfully",
        deviceToken,
      });
    } catch (error) {
      res.status(400).json({
        error: {
          code: "DEVICE_TOKEN_REGISTRATION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to register device token",
        },
      });
    }
  };

export const deleteDeviceToken =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required",
          },
        });

        return;
      }

      const tokenId =
        req.params.tokenId as string;

      await DeviceTokenService.deactivateDeviceToken(
        tokenId,
        req.user.userId
      );

      res.status(200).json({
        message:
          "Device token deactivated successfully",
      });
    } catch (error) {
      res.status(400).json({
        error: {
          code: "DEVICE_TOKEN_DEACTIVATION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to deactivate device token",
        },
      });
    }
  };