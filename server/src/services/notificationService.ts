import Notification from "../models/Notification";

import {
  NotificationStatus,
  NotificationType,
} from "../types/enums";

export interface CreateNotificationData {
  userId: string;
  requestId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export class NotificationService {

  // Create notification
  static async createNotification(
    data: CreateNotificationData
  ) {
    const {
      userId,
      requestId,
      title,
      message,
      type,
    } = data;

    // Prevent duplicate notifications
    // for the same donor and blood request.
    const existingNotification =
      await Notification.findOne({
        where: {
          user_id: userId,
          request_id: requestId,
          type,
        },
      });

    if (existingNotification) {
      return existingNotification;
    }

    const notification =
      await Notification.create({
        user_id: userId,
        request_id: requestId,
        title,
        message,
        type,
        status: NotificationStatus.PENDING,
      });

    return notification;
  }

  // Mark notification as sent
  static async markAsSent(
    notificationId: string
  ) {
    const notification =
      await Notification.findByPk(
        notificationId
      );

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    notification.status =
      NotificationStatus.SENT;

    notification.sent_at = new Date();

    await notification.save();

    return notification;
  }

  // Mark notification as failed
  static async markAsFailed(
    notificationId: string
  ) {
    const notification =
      await Notification.findByPk(
        notificationId
      );

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    notification.status =
      NotificationStatus.FAILED;

    await notification.save();

    return notification;
  }

  // Get donor notifications
  static async getMyNotifications(
    userId: string
  ) {
    const notifications =
      await Notification.findAll({
        where: {
          user_id: userId,
        },
        order: [
          ["created_at", "DESC"],
        ],
      });

    return notifications;
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: string,
    userId: string
  ) {
    const notification =
      await Notification.findByPk(
        notificationId
      );

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    // Make sure the notification
    // belongs to the authenticated user.
    if (
      notification.user_id !== userId
    ) {
      throw new Error(
        "You are not allowed to update this notification"
      );
    }

    notification.status =
      NotificationStatus.READ;

    await notification.save();

    return notification;
  }
}
