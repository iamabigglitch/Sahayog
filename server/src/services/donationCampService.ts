import DonationCamp from "../models/DonationCamp";
import CampRSVP from "../models/CampRSVP";
import DonorProfile from "../models/DonorProfile";
import Hospital from "../models/Hospital";
import City from "../models/City";
import User from "../models/User";

import {
  CampStatus,
  RSVPStatus,
  OrganizerType,
  UserRole,
} from "../types/enums";

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

export class DonationCampService {

  // Ensure the requester is an admin before any write
  private static async assertAdmin(userId: string) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error(
        "Only administrators can manage donation camps"
      );
    }
  }

  static async createCamp(
    userId: string,
    data: CreateDonationCampData
  ) {
    await this.assertAdmin(userId);

    const {
      cityId,
      hospitalId,
      ...rest
    } = data;

    // Check that the city exists
    const city = await City.findByPk(cityId);

    if (!city) {
      throw new Error("City not found");
    }

    // If a hospital is given, check it exists and belongs to the city
    if (hospitalId) {
      const hospital = await Hospital.findByPk(hospitalId);

      if (!hospital) {
        throw new Error("Hospital not found");
      }

      if (hospital.city_id !== cityId) {
        throw new Error(
          "Hospital does not belong to the selected city"
        );
      }
    }

    const camp = await DonationCamp.create({
      ...rest,
      city_id: cityId,
      hospital_id: hospitalId,
      organizer_name: rest.organizerName,
      organizer_type: rest.organizerType,
      camp_date: new Date(rest.campDate),
      start_time: rest.startTime,
      end_time: rest.endTime,
      status: CampStatus.UPCOMING,
    } as any);

    return camp;
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
    throw new Error(
      "Hospital does not belong to the selected city"
    );
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

  static async updateCampStatus(
    userId: string,
    campId: string,
    status: CampStatus
  ) {
    await this.assertAdmin(userId);

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    await camp.update({ status });

    return camp;
  }

  // Public: list camps, optionally filtered by city/status
  static async listCamps(filters: { cityId?: string; status?: CampStatus }) {
    const where: Record<string, unknown> = {};

    if (filters.cityId) where.city_id = filters.cityId;
    if (filters.status) where.status = filters.status;

    return DonationCamp.findAll({
      where,
      include: [
        { model: City, attributes: ["id", "name", "province"] },
      ],
      order: [["camp_date", "ASC"]],
    });
  }

  static async getCampById(campId: string) {
    const camp = await DonationCamp.findByPk(campId, {
      include: [
        { model: City, attributes: ["id", "name", "province"] },
      ],
    });

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    return camp;
  }

  // Donor RSVP — donor identity always derived from the authenticated user
  static async rsvpToCamp(userId: string, campId: string) {
    const donorProfile = await DonorProfile.findOne({
      where: { user_id: userId },
    });

    if (!donorProfile) {
      throw new Error("Donor profile not found");
    }

    const camp = await DonationCamp.findByPk(campId);

    if (!camp) {
      throw new Error("Donation camp not found");
    }

    if (camp.status !== CampStatus.UPCOMING) {
      throw new Error(
        "RSVP is only allowed for upcoming camps"
      );
    }

    const existingRsvp = await CampRSVP.findOne({
      where: {
        donor_id: donorProfile.id,
        camp_id: campId,
      },
    });

    if (existingRsvp) {
      throw new Error("You have already registered for this camp");
    }

    return CampRSVP.create({
      donor_id: donorProfile.id,
      camp_id: campId,
      status: RSVPStatus.REGISTERED,
    });
  }

  static async cancelRsvp(userId: string, campId: string) {
    const donorProfile = await DonorProfile.findOne({
      where: { user_id: userId },
    });

    if (!donorProfile) {
      throw new Error("Donor profile not found");
    }

    const rsvp = await CampRSVP.findOne({
      where: {
        donor_id: donorProfile.id,
        camp_id: campId,
      },
    });

    if (!rsvp) {
      throw new Error("RSVP not found");
    }

    await rsvp.update({ status: RSVPStatus.CANCELLED });

    return rsvp;
  }

  static async getMyRsvps(userId: string) {
    const donorProfile = await DonorProfile.findOne({
      where: { user_id: userId },
    });

    if (!donorProfile) {
      throw new Error("Donor profile not found");
    }

    return CampRSVP.findAll({
      where: { donor_id: donorProfile.id },
      include: [{ model: DonationCamp, as: "camp" }],
      order: [["registered_at", "DESC"]],
    });
  }
}