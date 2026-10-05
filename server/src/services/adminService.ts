import User from "../models/User";
import City from "../models/City";
import Hospital from "../models/Hospital";
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

// Builds the pagination block returned by every paged list
const paginate = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

// Names shown next to each blood request.
// The aliases must match the associations declared in models/index.ts.
const requestIncludes = [
  { model: Hospital, as: "hospital", attributes: ["id", "name"] },
  { model: City, as: "city", attributes: ["id", "name"] },
];

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

      requestedRequests,
      acceptedRequests,
      completedRequests,
      expiredRequests,

      totalCamps,
      upcomingCamps,
      ongoingCamps,
      completedCamps,
      cancelledCamps,

      registeredRsvps,
      attendedRsvps,
      cancelledRsvps,

      availableStocks,
      lowStocks,
      outOfStockStocks,
    ] = await Promise.all([
      User.count(),

      DonorProfile.count(),
      DonorProfile.count({ where: { donor_verified: true } }),
      DonorProfile.count({ where: { donor_verified: false } }),

      BloodRequest.count({ where: { status: RequestStatus.REQUESTED } }),
      BloodRequest.count({ where: { status: RequestStatus.ACCEPTED } }),
      BloodRequest.count({ where: { status: RequestStatus.COMPLETED } }),
      BloodRequest.count({ where: { status: RequestStatus.EXPIRED } }),

      DonationCamp.count(),
      DonationCamp.count({ where: { status: CampStatus.UPCOMING } }),
      DonationCamp.count({ where: { status: CampStatus.ONGOING } }),
      DonationCamp.count({ where: { status: CampStatus.COMPLETED } }),
      DonationCamp.count({ where: { status: CampStatus.CANCELLED } }),

      CampRSVP.count({ where: { status: RSVPStatus.REGISTERED } }),
      CampRSVP.count({ where: { status: RSVPStatus.ATTENDED } }),
      CampRSVP.count({ where: { status: RSVPStatus.CANCELLED } }),

      BloodBankStatus.count({ where: { status: BloodStockStatus.AVAILABLE } }),
      BloodBankStatus.count({ where: { status: BloodStockStatus.LOW } }),
      BloodBankStatus.count({ where: { status: BloodStockStatus.OUT_OF_STOCK } }),
    ]);

    return {
      users: {
        total: totalUsers,
        donors: totalDonors,
        verifiedDonors,
        unverifiedDonors,
      },

      bloodRequests: {
        requested: requestedRequests,
        accepted: acceptedRequests,
        completed: completedRequests,
        expired: expiredRequests,
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

      // Counts of hospital + blood group rows, not blood units
      bloodBank: {
        available: availableStocks,
        low: lowStocks,
        outOfStock: outOfStockStocks,
      },
    };
  }

  // Donor management
  static async listDonors(
    userId: string,
    filters: { verified?: string; page: number; limit: number }
  ) {
    await this.assertAdmin(userId);

    const where: Record<string, unknown> = {};

    if (filters.verified === "true") where.donor_verified = true;
    if (filters.verified === "false") where.donor_verified = false;

    const { rows, count } = await DonorProfile.findAndCountAll({
      where,
      // The phone number is how an admin recognises a donor
      include: [{ model: User, as: "user", attributes: ["id", "phone"] }],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      // Donor profiles have no created_at, so newest accounts come first
      order: [[{ model: User, as: "user" }, "created_at", "DESC"]],
    });

    return {
      donors: rows,
      pagination: paginate(filters.page, filters.limit, count),
    };
  }

  static async updateDonorVerification(userId: string, donorId: string, verified: boolean) {
    await this.assertAdmin(userId);

    const donor = await DonorProfile.findByPk(donorId);

    if (!donor) {
      throw new Error("Donor profile not found");
    }

    await donor.update({ donor_verified: verified });

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

    if (filters.status) where.status = filters.status;
    if (filters.urgency) where.urgency = filters.urgency;
    if (filters.cityId) where.city_id = filters.cityId;

    const { rows, count } = await BloodRequest.findAndCountAll({
      where,
      include: requestIncludes,
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      order: [["created_at", "DESC"]],
    });

    return {
      requests: rows,
      pagination: paginate(filters.page, filters.limit, count),
    };
  }

  static async getBloodRequestById(userId: string, requestId: string) {
    await this.assertAdmin(userId);

    const request = await BloodRequest.findByPk(requestId, {
      include: requestIncludes,
    });

    if (!request) {
      throw new Error("Blood request not found");
    }

    return request;
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

    if (status === RequestStatus.COMPLETED) {
      throw new Error(
        "Completed requests must be finalized through the accepted donor fulfillment flow"
      );
    }

    if (request.status === RequestStatus.COMPLETED) {
      throw new Error("A completed blood request cannot be changed");
    }

    if (request.status === RequestStatus.EXPIRED) {
      throw new Error("An expired blood request cannot be changed");
    }

    const validTransitions: Partial<Record<RequestStatus, RequestStatus[]>> = {
      [RequestStatus.REQUESTED]: [RequestStatus.ACCEPTED, RequestStatus.EXPIRED],
      [RequestStatus.ACCEPTED]: [RequestStatus.EXPIRED],
    };

    if (!validTransitions[request.status]?.includes(status)) {
      throw new Error("Invalid blood request status transition");
    }

    await request.update({ status });

    return request;
  }

  // Donation camp management
  static async listAllDonationCamps(userId: string) {
    await this.assertAdmin(userId);

    return DonationCamp.findAll({
      include: [{ model: City, as: "city", attributes: ["id", "name"] }],
      order: [
        ["camp_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });
  }

  static async getDonationCamp(userId: string, campId: string) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return camp;
  }

  static async updateDonationCampStatus(userId: string, campId: string, status: CampStatus) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    await camp.update({ status });

    return camp;
  }

  // RSVP / attendance management
  static async listCampRsvps(userId: string, campId: string) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return CampRSVP.findAll({
      where: { camp_id: campId },
      include: [
        {
          model: DonorProfile,
          as: "donor",
          // The phone number is how an admin recognises who attended
          include: [{ model: User, as: "user", attributes: ["id", "phone"] }],
        },
      ],
      order: [["registered_at", "ASC"]],
    });
  }

  static async updateCampRsvpStatus(userId: string, rsvpId: string, status: RSVPStatus) {
    await this.assertAdmin(userId);

    const rsvp = await CampRSVP.findByPk(rsvpId);

    if (!rsvp) {
      throw new Error("RSVP not found");
    }

    await rsvp.update({ status });

    return rsvp;
  }
}