import {
  getMessaging,
  Message,
} from "firebase-admin/messaging";

import firebaseAdmin from "../config/firebase";

export interface FcmNotificationData {
  token: string;
  title: string;
  message: string;
  data?: Record<string, string>;
}

export class FcmService {
  static async sendNotification(
    notificationData: FcmNotificationData
  ): Promise<string> {
    const {
      token,
      title,
      message,
      data,
    } = notificationData;

    const messaging = getMessaging(firebaseAdmin);

    const fcmMessage: Message = {
      token,

      notification: {
        title,
        body: message,
      },

      data: data ?? {},

      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "sahayog_notifications",
        },
      },

      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };

    return messaging.send(fcmMessage);
  }
}