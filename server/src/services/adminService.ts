import User from "../models/User";
import DonorProfile from "../models/DonorProfile";
import BloodRequest from "../models/BloodRequest";
import DonationCamp from "../models/DonationCamp";
import CampRSVP from "../models/CampRSVP";
import BloodBankStatus from "../models/BloodBankStatus";

import {
  BloodStockStatus,
  CampStatus,
  RequestStatus,
  RSVPStatus,
  UserRole,
} from "../types/enums";

export class AdminService {

  // Admin authorization
  private static async assertAdmin(userId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error("Only administrators can perform this action");
    }

    return user;
  }

  // Dashboard
  static async getDashboardStats(userId: string) {
    await this.assertAdmin(userId);

    const [
      totalUsers,
      totalDonors,
      verifiedDonors,
      unverifiedDonors,

      requestedBloodRequests,
      acceptedBloodRequests,
      completedBloodRequests,
      expiredBloodRequests,

      totalCamps,
      upcomingCamps,
      ongoingCamps,
      completedCamps,
      cancelledCamps,

      registeredRsvps,
      attendedRsvps,
      cancelledRsvps,

      availableBloodStocks,
      lowBloodStocks,
      outOfStockBloodStocks,
    ] = await Promise.all([
      // Users
      User.count(),

      // Donors
      DonorProfile.count(),

      DonorProfile.count({
        where: {
          donor_verified: true,
        },
      }),

      DonorProfile.count({
        where: {
          donor_verified: false,
        },
      }),

      // Blood requests
      BloodRequest.count({
        where: {
          status: RequestStatus.REQUESTED,
        },
      }),

      BloodRequest.count({
        where: {
          status: RequestStatus.ACCEPTED,
        },
      }),

      BloodRequest.count({
        where: {
          status: RequestStatus.COMPLETED,
        },
      }),

      BloodRequest.count({
        where: {
          status: RequestStatus.EXPIRED,
        },
      }),

      // Donation camps
      DonationCamp.count(),

      DonationCamp.count({
        where: {
          status: CampStatus.UPCOMING,
        },
      }),

      DonationCamp.count({
        where: {
          status: CampStatus.ONGOING,
        },
      }),

      DonationCamp.count({
        where: {
          status: CampStatus.COMPLETED,
        },
      }),

      DonationCamp.count({
        where: {
          status: CampStatus.CANCELLED,
        },
      }),

      // Camp RSVPs
      CampRSVP.count({
        where: {
          status: RSVPStatus.REGISTERED,
        },
      }),

      CampRSVP.count({
        where: {
          status: RSVPStatus.ATTENDED,
        },
      }),

      CampRSVP.count({
        where: {
          status: RSVPStatus.CANCELLED,
        },
      }),

      // Blood bank
      BloodBankStatus.count({
        where: {
          status: BloodStockStatus.AVAILABLE,
        },
      }),

      BloodBankStatus.count({
        where: {
          status: BloodStockStatus.LOW,
        },
      }),

      BloodBankStatus.count({
        where: {
          status: BloodStockStatus.OUT_OF_STOCK,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        donors: totalDonors,
        verifiedDonors,
        unverifiedDonors,
      },

      bloodRequests: {
        requested: requestedBloodRequests,
        accepted: acceptedBloodRequests,
        completed: completedBloodRequests,
        expired: expiredBloodRequests,
      },

      donationCamps: {
        total: totalCamps,
        upcoming: upcomingCamps,
        ongoing: ongoingCamps,
        completed: completedCamps,
        cancelled: cancelledCamps,
      },

      campRsvps: {
        registered: registeredRsvps,
        attended: attendedRsvps,
        cancelled: cancelledRsvps,
      },

      bloodBank: {
        available: availableBloodStocks,
        low: lowBloodStocks,
        outOfStock: outOfStockBloodStocks,
      },
    };
  }

  // Donor management
  static async listDonors(
    userId: string,
    filters: {
      verified?: string;
      page: number;
      limit: number;
    }
  ) {
    await this.assertAdmin(userId);

    const where: Record<string, unknown> = {};

    if (filters.verified === "true") {
      where.donor_verified = true;
    }

    if (filters.verified === "false") {
      where.donor_verified = false;
    }

    const offset = (filters.page - 1) * filters.limit;

    const { rows, count } = await DonorProfile.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return {
      donors: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count,
        totalPages: Math.ceil(count / filters.limit),
      },
    };
  }

  static async updateDonorVerification(
    userId: string,
    donorId: string,
    verified: boolean
  ) {
    await this.assertAdmin(userId);

    const donor = await DonorProfile.findByPk(donorId);

    if (!donor) {
      throw new Error("Donor profile not found");
    }

    await donor.update({
      donor_verified: verified,
    });

    return donor;
  }

  // Blood request management
  static async listBloodRequests(
    userId: string,
    filters: {
      status?: RequestStatus;
      urgency?: string;
      cityId?: string;
      page: number;
      limit: number;
    }
  ) {
    await this.assertAdmin(userId);

    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.urgency) {
      where.urgency = filters.urgency;
    }

    if (filters.cityId) {
      where.city_id = filters.cityId;
    }

    const offset = (filters.page - 1) * filters.limit;

    const { rows, count } = await BloodRequest.findAndCountAll({
      where,
      limit: filters.limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return {
      requests: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: count,
        totalPages: Math.ceil(count / filters.limit),
      },
    };
  }

  static async updateBloodRequestStatus(
    userId: string,
    requestId: string,
    status: RequestStatus
  ) {
    await this.assertAdmin(userId);

    const request = await BloodRequest.findByPk(requestId);

    if (!request) {
      throw new Error("Blood request not found");
    }

    await request.update({
      status,
    });

    return request;
  }

  static async getBloodRequestById(
    userId: string,
    requestId: string
  ) {
    await this.assertAdmin(userId);

    const request = await BloodRequest.findByPk(requestId);

    if (!request) {
      throw new Error("Blood request not found");
    }

    return request;
  }

  // Donation camp management
  static async listAllDonationCamps(userId: string) {
    await this.assertAdmin(userId);

    return DonationCamp.findAll({
      order: [
        ["camp_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  static async getDonationCamp(
    userId: string,
    campId: string
  ) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return camp;
  }

  static async updateDonationCampStatus(
    userId: string,
    campId: string,
    status: CampStatus
  ) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    await camp.update({
      status,
    });

    return camp;
  }

  // RSVP / attendance management
  static async listCampRsvps(
    userId: string,
    campId: string
  ) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return CampRSVP.findAll({
      where: {
        camp_id: campId,
      },
      include: [
        {
          model: DonorProfile,
          as: "donor",
        },
      ],
      order: [["registered_at", "ASC"]],
    });
  }

  static async updateCampRsvpStatus(
    userId: string,
    rsvpId: string,
    status: RSVPStatus
  ) {
    await this.assertAdmin(userId);

    const rsvp = await CampRSVP.findByPk(rsvpId);

    if (!rsvp) {
      throw new Error("RSVP not found");
    }

    await rsvp.update({
      status,
    });

    return rsvp;
  }
}
