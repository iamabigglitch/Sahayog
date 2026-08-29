import {
  DonorMatchingService,
  MatchedDonor,
} from "./donorMatchingService";

import {
  NotificationService,
} from "./notificationService";

import {
  NotificationType,
} from "../types/enums";

export interface BroadcastResult {
  requestId: string;
  notifiedDonors: MatchedDonor[];
}

export class RequestBroadcastService {

  // Maximum number of donors
  // notified in a single broadcast.
  private static readonly MAX_DONORS = 10; 


  // Broadcast blood request
  static async broadcastRequest(
    requestId: string
  ): Promise<BroadcastResult> {

    // Find and rank eligible donors.
    const matches =
      await DonorMatchingService.findMatches(
        requestId
      );

    // Select the highest-ranked donors.
    const selectedDonors =
      matches.slice(
        0,
        this.MAX_DONORS
      );


    // Create notifications.
    for (const donor of selectedDonors) {

      await NotificationService.createNotification({
        userId: donor.donorId,

        requestId,

        title: "Blood Donation Request",

        message:
          `A ${donor.bloodGroup} donor is needed. ` +
          `You have been identified as a potential match ` +
          `for an emergency blood request.`,

        type: NotificationType.REQUEST,
      });
    }

    return {
      requestId,
      notifiedDonors: selectedDonors,
    };
  }
}
