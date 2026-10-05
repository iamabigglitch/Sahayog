import { Request, Response } from "express";

import {
  NotificationService,
} from "../services/notificationService";

// Get my notifications
export const getMyNotifications = async (
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

    const notifications =
      await NotificationService.getMyNotifications(
        req.user.userId
      );

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "NOTIFICATIONS_FETCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
      },
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
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

    const notificationId =
      req.params.notificationId as string;

    const notification =
      await NotificationService.markAsRead(
        notificationId,
        req.user.userId
      );

    res.status(200).json({
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "NOTIFICATION_READ_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      },
    });
  }
};

// Admin: send an announcement to donors
export const createAnnouncement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, message, cityId, bloodGroup } = req.body;

    const result =
      await NotificationService.sendAnnouncement({
        title,
        message,
        cityId,
        bloodGroup,
      });

    res.status(201).json({
      message: "Notification sent",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "ANNOUNCEMENT_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send the notification",
      },
    });
  }
};