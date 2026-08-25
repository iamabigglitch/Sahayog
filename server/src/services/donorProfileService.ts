import DonorProfile from "../models/DonorProfile";
import City from "../models/City";

import {
  BloodGroup,
} from "../types/enums";

export interface UpdateDonorProfileData {
  bloodGroup?: BloodGroup;
  cityId?: string;
  latitude?: number;
  longitude?: number;
  lastDonationDate?: string;
}

export class DonorProfileService {

  // Always resolves the profile from the authenticated userId,
  // never from a client-supplied profile or donor id.
  static async getMyProfile(userId: string) {
    const profile = await DonorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!profile) {
      throw new Error("Donor profile not found");
    }

    return profile;
  }

  static async updateMyProfile(
    userId: string,
    data: UpdateDonorProfileData
  ) {
    const {
      bloodGroup,
      cityId,
      latitude,
      longitude,
      lastDonationDate,
    } = data;

    const profile = await DonorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!profile) {
      throw new Error("Donor profile not found");
    }

    // Check that the city exists, if provided
    if (cityId) {
      const city = await City.findByPk(cityId);

      if (!city) {
        throw new Error("City not found");
      }
    }

    await profile.update({
  ...(bloodGroup && { blood_group: bloodGroup }),
  ...(cityId && { city_id: cityId }),
  ...(latitude !== undefined && { latitude }),
  ...(longitude !== undefined && { longitude }),
  ...(lastDonationDate && {
    last_donation_date: new Date(lastDonationDate),
  }),
});

    return profile;
  }

  static async updateAvailability(
    userId: string,
    available: boolean
  ) {
    const profile = await DonorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!profile) {
      throw new Error("Donor profile not found");
    }

    await profile.update({
      available,
    });

    return profile;
  }

  // Public view — deliberately narrow.
  // No location, no phone, no health data.
  static async getPublicProfile(donorId: string) {
    const profile = await DonorProfile.findByPk(donorId, {
      attributes: [
        "id",
        "blood_group",
        "donor_verified",
      ],
    });

    if (!profile) {
      throw new Error("Donor not found");
    }

    return profile;
  }
}