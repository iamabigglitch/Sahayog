import sequelize from "../config/database";
import DonationHistory from "../models/DonationHistory";
import DonorProfile from "../models/DonorProfile";
import BloodRequest from "../models/BloodRequest";
import RequestResponse from "../models/RequestResponse";

import {
  DonationStatus,
  RequestStatus,
  ResponseStatus,
} from "../types/enums";

export interface CreateDonationHistoryData {
  donorId: string;
  requestId: string;
  status: DonationStatus;
  donationDate: string;
}

export class DonationHistoryService {

  // Create Donation History
  // Admin only
  static async createDonationHistory(
    data: CreateDonationHistoryData
  ) {
    const {
      donorId,
      requestId,
      status,
      donationDate,
    } = data;

    // Check donor
    const donor =
      await DonorProfile.findByPk(donorId);

    if (!donor) {
      throw new Error(
        "Donor profile not found"
      );
    }

    // Check blood request
    const bloodRequest =
      await BloodRequest.findByPk(requestId);

    if (!bloodRequest) {
      throw new Error(
        "Blood request not found"
      );
    }

    // Donation should only be recorded
    // for an accepted blood request.
    if (
      bloodRequest.status !==
      RequestStatus.ACCEPTED
    ) {
      throw new Error(
        "Donation can only be recorded for an accepted blood request"
      );
    }

    // Prevent duplicate donation history
    const existingDonation =
      await DonationHistory.findOne({
        where: {
          donor_id: donorId,
          request_id: requestId,
        },
      });

    if (existingDonation) {
      throw new Error(
        "Donation history already exists for this request"
      );
    }

    // Validate donation date
    const parsedDonationDate =
      new Date(donationDate);

    if (
      Number.isNaN(
        parsedDonationDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid donation date"
      );
    }

    // Prevent future donation dates
    if (
      parsedDonationDate > new Date()
    ) {
      throw new Error(
        "Donation date cannot be in the future"
      );
    }

    // Create donation history
    const donation =
      await DonationHistory.create({
        donor_id: donorId,
        request_id: requestId,
        status,
        donation_date:
          parsedDonationDate,
      });

    // Update donor's last donation date
    // only when donation is completed.
    if (
      status === DonationStatus.COMPLETED
    ) {
      donor.last_donation_date =
        parsedDonationDate;

      await donor.save();
    }

    return donation;
  }

  // Get My Donation History
  // Donor only
  static async getMyDonationHistory(
    userId: string
  ) {
    const donor =
      await DonorProfile.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!donor) {
      throw new Error(
        "Donor profile not found"
      );
    }

    const history =
      await DonationHistory.findAll({
        where: {
          donor_id: donor.id,
        },
        order: [
          ["donation_date", "DESC"],
        ],
      });

    return history;
  }

  // Get Single Donation History
  // Donor only
  static async getDonationHistoryById(
    donationId: string,
    userId: string
  ) {
    const donor =
      await DonorProfile.findOne({
        where: {
          user_id: userId,
        },
      });

    if (!donor) {
      throw new Error(
        "Donor profile not found"
      );
    }

    const donation =
      await DonationHistory.findByPk(
        donationId
      );

    if (!donation) {
      throw new Error(
        "Donation history not found"
      );
    }

    // Ownership check
    if (
      donation.donor_id !== donor.id
    ) {
      throw new Error(
        "You are not allowed to access this donation history"
      );
    }

    return donation;
  }

  // Update Donation Status
  // Admin only
  static async updateDonationStatus(
    donationId: string,
    status: DonationStatus
  ) {
    const donation =
      await DonationHistory.findByPk(
        donationId
      );

    if (!donation) {
      throw new Error(
        "Donation history not found"
      );
    }

    // Validate status
    if (
      status !== DonationStatus.COMPLETED &&
      status !== DonationStatus.CANCELLED &&
      status !== DonationStatus.NO_SHOW
    ) {
      throw new Error(
        "Invalid donation status"
      );
    }

    // A completed donation should not
    // later be changed to cancelled/no-show.
    if (
      donation.status ===
        DonationStatus.COMPLETED &&
      status !== DonationStatus.COMPLETED
    ) {
      throw new Error(
        "A completed donation cannot be changed"
      );
    }

    donation.status = status;

    await donation.save();

    // Update donor's last donation date
    // when completed.
    if (
      status === DonationStatus.COMPLETED
    ) {
      const donor =
        await DonorProfile.findByPk(
          donation.donor_id
        );

      if (!donor) {
        throw new Error(
          "Donor profile not found"
        );
      }

      donor.last_donation_date =
        donation.donation_date;

      await donor.save();
    }

    return donation;
  }

  // Complete the accepted request using the donor who was matched and accepted.
  // This is the only supported path to move a request from ACCEPTED to COMPLETED.
  static async completeAcceptedRequest(
    requestId: string,
    userId: string,
    donationDate: Date = new Date()
  ) {
    if (Number.isNaN(donationDate.getTime())) {
      throw new Error("Invalid donation date");
    }

    const donor = await DonorProfile.findOne({
      where: { user_id: userId },
    });

    if (!donor) {
      throw new Error("Donor profile not found");
    }

    const request = await BloodRequest.findByPk(requestId);

    if (!request) {
      throw new Error("Blood request not found");
    }

    if (request.status !== RequestStatus.ACCEPTED) {
      throw new Error(
        "Only an accepted blood request can be completed"
      );
    }

    if (request.expires_at <= new Date()) {
      throw new Error("This blood request has expired");
    }

    const acceptedResponse = await RequestResponse.findOne({
      where: {
        request_id: requestId,
        donor_id: donor.id,
        status: ResponseStatus.ACCEPTED,
      },
    });

    if (!acceptedResponse) {
      throw new Error(
        "You are not the accepted donor for this blood request"
      );
    }

    const transaction = await sequelize.transaction();

    try {
      const existingDonation = await DonationHistory.findOne({
        where: {
          donor_id: donor.id,
          request_id: requestId,
        },
        transaction,
      });

      if (existingDonation) {
        throw new Error(
          "Donation history already exists for this request"
        );
      }

      const completedDonation = await DonationHistory.create(
        {
          donor_id: donor.id,
          request_id: requestId,
          status: DonationStatus.COMPLETED,
          donation_date: donationDate,
        },
        { transaction }
      );

      await request.update(
        { status: RequestStatus.COMPLETED },
        { transaction }
      );

      donor.last_donation_date = donationDate;
      await donor.save({ transaction });

      await transaction.commit();

      return completedDonation;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}