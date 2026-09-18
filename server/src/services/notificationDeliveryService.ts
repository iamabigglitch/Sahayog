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

        // Try to detect permanent invalid token errors from the
        // Firebase Admin SDK. Prefer structured error codes when
        // available, otherwise fall back to message text.
        const errAny = error as any;
        const codeStr =
          (typeof errAny?.code === "string" && errAny.code) ||
          (typeof errAny?.errorInfo?.code === "string" && errAny.errorInfo.code) ||
          (errAny instanceof Error && errAny.message) ||
          "";

        const lower = String(codeStr).toLowerCase();

        // Permanent token errors reported by FCM:
        // - messaging/registration-token-not-registered
        // - messaging/invalid-registration-token
        // Some environments return a message containing these
        // substrings rather than a code property, so check both.
        if (
          lower.includes("registration-token-not-registered") ||
          lower.includes("invalid-registration-token") ||
          lower.includes("not-registered") ||
          lower.includes("invalid-registration-token")
        ) {
          try {
            deviceToken.is_active = false;
            await deviceToken.save();
          } catch (saveErr) {
            console.error(
              `Failed to deactivate device token ${deviceToken.id}:`,
              saveErr
            );
          }
        }

        // Continue delivering to other device tokens — do not rethrow.
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