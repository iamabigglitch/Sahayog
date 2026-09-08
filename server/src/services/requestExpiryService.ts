import { Op } from "sequelize";
import BloodRequest from "../models/BloodRequest";
import { RequestStatus } from "../types/enums";

const EXPIRY_CHECK_INTERVAL = 60 * 1000;

export class RequestExpiryService {

  // Core logic: expire any REQUESTED or ACCEPTED request whose
  // expires_at has already passed. COMPLETED requests are untouched.
  static async expireRequests(): Promise<number> {
    const [updatedCount] = await BloodRequest.update(
      {
        status: RequestStatus.EXPIRED,
      },
      {
        where: {
          status: {
            [Op.in]: [RequestStatus.REQUESTED, RequestStatus.ACCEPTED],
          },
          expires_at: {
            [Op.lte]: new Date(),
          },
        },
      }
    );

    return updatedCount;
  }

  // Scheduling wrapper: runs expireRequests() once immediately,
  // then repeats every 60 seconds for the life of the process.
  static startExpiryJob(): NodeJS.Timeout {
    const runExpiryCheck = async () => {
      try {
        const expiredCount = await this.expireRequests();
        if (expiredCount > 0) {
          console.log(`Request expiry job: ${expiredCount} request(s) expired.`);
        }
      } catch (error) {
        console.error("Request expiry job failed:", error);
      }
    };

    void runExpiryCheck();

    return setInterval(() => {
      void runExpiryCheck();
    }, EXPIRY_CHECK_INTERVAL);
  }
}