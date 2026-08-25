import RequestResponse from "../models/RequestResponse";
import BloodRequest from "../models/BloodRequest";
import DonorProfile from "../models/DonorProfile";

import {
  RequestStatus,
  ResponseStatus,
} from "../types/enums";

export interface CreateRequestResponseData {
  requestId: string;
  userId: string;
}

export class RequestResponseService {
  static async createResponse(
    data: CreateRequestResponseData
  ) {
    const {
      requestId,
      userId,
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
      await DonorProfile.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!donor) {
      throw new Error("Donor profile not found");
    }

    // Check if the donor has already responded
    const existingResponse =
      await RequestResponse.findOne({
        where: {
          request_id: requestId,
          donor_id: donor.id,
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
        donor_id: donor.id,
        status: ResponseStatus.PENDING,
        responded_at: new Date(),
      });

    return response;
  }

  static async updateResponseStatus(
    responseId: string,
    userId: string,
    status: ResponseStatus
  ) {

    // Find the response
    const response =
      await RequestResponse.findByPk(responseId);

    if (!response) {
      throw new Error("Response not found");
    }

    // Find the donor associated with the authenticated user
    const donor =
      await DonorProfile.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!donor) {
      throw new Error("Donor profile not found");
    }

    // Make sure this response belongs to the authenticated donor
    if (response.donor_id !== donor.id) {
      throw new Error(
        "You are not allowed to update this response"
      );
    }

    // A response can only be changed while it is pending
    if (
      response.status !==
      ResponseStatus.PENDING
    ) {
      throw new Error(
        "This response has already been processed"
      );
    }

    // Find the blood request
    const bloodRequest =
      await BloodRequest.findByPk(
        response.request_id
      );

    if (!bloodRequest) {
      throw new Error(
        "Blood request not found"
      );
    }

    // The request must still be active
    if (
      bloodRequest.status !==
      RequestStatus.REQUESTED
    ) {
      throw new Error(
        "This blood request is no longer active"
      );
    }

    // Check request expiry
    if (
      new Date() >=
      bloodRequest.expires_at
    ) {
      throw new Error(
        "This blood request has expired"
      );
    }

    // Only ACCEPTED or DECLINED are valid updates
    if (
      status !== ResponseStatus.ACCEPTED &&
      status !== ResponseStatus.DECLINED
    ) {
      throw new Error(
        "Invalid response status"
      );
    }

    // Update the response
    response.status = status;
    response.responded_at = new Date();

    await response.save();

    // If donor was accepted,
    // mark the blood request as accepted
    if (
      status ===
      ResponseStatus.ACCEPTED
    ) {
      bloodRequest.status =
        RequestStatus.ACCEPTED;

      await bloodRequest.save();
    }

    return response;
  }
}