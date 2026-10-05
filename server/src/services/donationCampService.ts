import DonationCamp from "../models/DonationCamp";
import CampRSVP from "../models/CampRSVP";
import DonorProfile from "../models/DonorProfile";
import Hospital from "../models/Hospital";
import City from "../models/City";
import User from "../models/User";

import { CampStatus, RSVPStatus, OrganizerType, UserRole } from "../types/enums";

export interface CreateDonationCampData {
  title: string;
  description?: string;
  venue: string;
  cityId: string;
  hospitalId?: string;
  organizerName: string;
  organizerType: OrganizerType;
  campDate: string;
  startTime: string;
  endTime: string;
}

// The alias must match the association declared in models/index.ts.
const cityInclude = { model: City, as: "city", attributes: ["id", "name"] };

export class DonationCampService {
  // Ensure the requester is an admin before any write
  private static async assertAdmin(userId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error("Only administrators can manage donation camps");
    }
  }

  // Look up the donor profile for the logged-in user
  private static async getDonorProfile(userId: string) {
    const donorProfile = await DonorProfile.findOne({ where: { user_id: userId } });

    if (!donorProfile) {
      throw new Error("Donor profile not found");
    }

    return donorProfile;
  }

  static async createCamp(userId: string, data: CreateDonationCampData) {
    await this.assertAdmin(userId);

    const city = await City.findByPk(data.cityId);

    if (!city) {
      throw new Error("City not found");
    }

    // If a hospital is given, it must exist and belong to the city
    if (data.hospitalId) {
      const hospital = await Hospital.findByPk(data.hospitalId);

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      if (hospital.city_id !== data.cityId) {
        throw new Error("Hospital does not belong to the selected city");
      }
    }

    return DonationCamp.create({
      title: data.title,
      description: data.description,
      venue: data.venue,
      city_id: data.cityId,
      hospital_id: data.hospitalId,
      organizer_name: data.organizerName,
      organizer_type: data.organizerType,
      camp_date: new Date(data.campDate),
      start_time: data.startTime,
      end_time: data.endTime,
      status: CampStatus.UPCOMING,
    });
  }

  static async updateCamp(
    userId: string,
    campId: string,
    data: Partial<CreateDonationCampData>
  ) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    if (data.cityId) {
      const city = await City.findByPk(data.cityId);

      if (!city) {
        throw new Error("City not found");
      }
    }

    if (data.hospitalId) {
      const hospital = await Hospital.findByPk(data.hospitalId);

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      const cityId = data.cityId ?? camp.city_id;

      if (hospital.city_id !== cityId) {
        throw new Error("Hospital does not belong to the selected city");
      }
    }

    await camp.update({
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.venue && { venue: data.venue }),
      ...(data.cityId && { city_id: data.cityId }),
      ...(data.hospitalId !== undefined && { hospital_id: data.hospitalId }),
      ...(data.organizerName && { organizer_name: data.organizerName }),
      ...(data.organizerType && { organizer_type: data.organizerType }),
      ...(data.campDate && { camp_date: new Date(data.campDate) }),
      ...(data.startTime && { start_time: data.startTime }),
      ...(data.endTime && { end_time: data.endTime }),
    });

    return camp;
  }

  static async updateCampStatus(userId: string, campId: string, status: CampStatus) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    await camp.update({ status });

    return camp;
  }

  // Public: list camps, optionally filtered by city and status
  static async listCamps(filters: { cityId?: string; status?: CampStatus }) {
    const where: Record<string, unknown> = {};

    if (filters.cityId) where.city_id = filters.cityId;
    if (filters.status) where.status = filters.status;

    return DonationCamp.findAll({
      where,
      include: [cityInclude],
      order: [["camp_date", "ASC"]],
    });
  }

  static async getCampById(campId: string) {
    const camp = await DonationCamp.findByPk(campId, { include: [cityInclude] });

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return camp;
  }

  // Donor RSVP: donor identity always comes from the authenticated user
  static async rsvpToCamp(userId: string, campId: string) {
    const donorProfile = await this.getDonorProfile(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    if (camp.status !== CampStatus.UPCOMING) {
      throw new Error("RSVP is only allowed for upcoming camps");
    }

    const existingRsvp = await CampRSVP.findOne({
      where: { donor_id: donorProfile.id, camp_id: campId },
    });

    if (existingRsvp) {
      if (existingRsvp.status !== RSVPStatus.CANCELLED) {
        throw new Error("You have already registered for this camp");
      }

      // Registering again after a cancellation reuses the same row
      await existingRsvp.update({
        status: RSVPStatus.REGISTERED,
        registered_at: new Date(),
      });

      return existingRsvp;
    }

    return CampRSVP.create({
      donor_id: donorProfile.id,
      camp_id: campId,
      status: RSVPStatus.REGISTERED,
    });
  }

  static async cancelRsvp(userId: string, campId: string) {
    const donorProfile = await this.getDonorProfile(userId);

    const rsvp = await CampRSVP.findOne({
      where: { donor_id: donorProfile.id, camp_id: campId },
    });

    if (!rsvp) {
      throw new Error("RSVP not found");
    }

    await rsvp.update({ status: RSVPStatus.CANCELLED });

    return rsvp;
  }

  static async getMyRsvps(userId: string) {
    const donorProfile = await this.getDonorProfile(userId);

    return CampRSVP.findAll({
      where: { donor_id: donorProfile.id },
      include: [{ model: DonationCamp, as: "camp" }],
      order: [["registered_at", "DESC"]],
    });
  }
}