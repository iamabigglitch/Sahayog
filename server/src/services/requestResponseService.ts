import RequestResponse from "../models/RequestResponse";
import BloodRequest from "../models/BloodRequest";
import DonorProfile from "../models/DonorProfile";

import {
  RequestStatus,
  ResponseStatus,
} from "../types/enums";

export interface CreateRequestResponseData {
  requestId: string;
  donorId: string;
}

export class RequestResponseService {
  static async createResponse(
    data: CreateRequestResponseData
  ) {
    const {
      requestId,
      donorId,
    } = data;

    // Check that the blood request exists
    const bloodRequest =
      await BloodRequest.findByPk(requestId);

    if (!bloodRequest) {
      throw new Error("Blood request not found");
    }

    // Check that the request is still active
    if (
      bloodRequest.status !==
      RequestStatus.REQUESTED
    ) {
      throw new Error(
        "This blood request is no longer accepting responses"
      );
    }

    // Check that the request has not expired
    if (
      new Date() >= bloodRequest.expires_at
    ) {
      throw new Error(
        "This blood request has expired"
      );
    }

    // Check that the donor exists
    const donor =
      await DonorProfile.findByPk(donorId);

    if (!donor) {
      throw new Error("Donor not found");
    }

    // Check if the donor has already responded
    const existingResponse =
      await RequestResponse.findOne({
        where: {
          request_id: requestId,
          donor_id: donorId,
        },
      });

    if (existingResponse) {
      throw new Error(
        "Donor has already responded to this request"
      );
    }

    // Create the response
    const response =
      await RequestResponse.create({
        request_id: requestId,
        donor_id: donorId,
        status: ResponseStatus.PENDING,
        responded_at: new Date(),
      });

    return response;
  }
}