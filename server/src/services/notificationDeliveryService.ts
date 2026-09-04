import Notification from "../models/Notification";
import DeviceToken from "../models/DeviceToken";

import { FcmService } from "./fcmService";
import {
  NotificationService,
} from "./notificationService";

export class NotificationDeliveryService {
  static async deliverNotification(
    notificationId: string
  ): Promise<void> {
    const notification =
      await Notification.findByPk(notificationId);

    if (!notification) {
      throw new Error("Notification not found");
    }

    const deviceTokens =
      await DeviceToken.findAll({
        where: {
          user_id: notification.user_id,
          is_active: true,
        },
      });

    if (deviceTokens.length === 0) {
      await NotificationService.markAsFailed(
        notification.id
      );

      return;
    }

    let delivered = false;

    for (const deviceToken of deviceTokens) {
      try {
        await FcmService.sendNotification({
          token: deviceToken.token,
          title: notification.title,
          message: notification.message,
          data: {
            notificationId: notification.id,
            requestId: notification.request_id,
            type: notification.type,
          },
        });

        delivered = true;
      } catch (error) {
        console.error(
          `FCM delivery failed for device ${deviceToken.id}:`,
          error
        );

        const errorMessage =
          error instanceof Error
            ? error.message.toLowerCase()
            : "";

        if (
          errorMessage.includes(
            "registration-token-not-registered"
          ) ||
          errorMessage.includes(
            "invalid-registration-token"
          )
        ) {
          deviceToken.is_active = false;
          await deviceToken.save();
        }
      }
    }

    if (delivered) {
      await NotificationService.markAsSent(
        notification.id
      );
    } else {
      await NotificationService.markAsFailed(
        notification.id
      );
    }
  }
}