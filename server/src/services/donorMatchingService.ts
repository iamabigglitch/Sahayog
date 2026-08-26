import BloodRequest from "../models/BloodRequest";
import DonorProfile from "../models/DonorProfile";
import Hospital from "../models/Hospital";

import { RequestStatus } from "../types/enums";

import { isBloodGroupCompatible } from "../utils/bloodCompatibility";
import { isDonorEligible } from "../utils/donorEligibility";
import { calculateDistanceInKm } from "../utils/distance";
import { calculateMatchingScore } from "../utils/matchingScore";

export interface MatchedDonor {
  donorId: string;
  bloodGroup: string;
  cityId: string;
  donorVerified: boolean;
  trustScore: number;
  distanceKm?: number;
  matchingScore: number;
}

export class DonorMatchingService {
  static async findMatches(
    requestId: string
  ): Promise<MatchedDonor[]> {


    // 1. Find the blood request
    const bloodRequest =
      await BloodRequest.findByPk(requestId);

    if (!bloodRequest) {
      throw new Error("Blood request not found");
    }

    // 2. Make sure the request is still active
    if (
      bloodRequest.status !==
      RequestStatus.REQUESTED
    ) {
      throw new Error(
        "This blood request is no longer accepting matches"
      );
    }

    // 3. Check request expiry
    if (
      new Date() >= bloodRequest.expires_at
    ) {
      throw new Error(
        "This blood request has expired"
      );
    }

    // 4. Find the hospital
    const hospital =
      await Hospital.findByPk(
        bloodRequest.hospital_id
      );

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // 5. Get all donor profiles
    const donors =
      await DonorProfile.findAll();

    const matches: MatchedDonor[] = [];

    // 6. Filter and score donors
    for (const donor of donors) {

      // Blood compatibility
      const bloodCompatible =
        isBloodGroupCompatible(
          donor.blood_group,
          bloodRequest.blood_group_needed
        );

      if (!bloodCompatible) {
        continue;
      }

      // Donation eligibility
      if (!isDonorEligible(donor)) {
        continue;
      }

      // Calculate distance when both locations exist
      let distanceKm:
        | number
        | undefined;

      if (
        donor.latitude !== undefined &&
        donor.longitude !== undefined &&
        hospital.latitude !== undefined &&
        hospital.longitude !== undefined
      ) {
        distanceKm =
          calculateDistanceInKm(
            Number(donor.latitude),
            Number(donor.longitude),
            Number(hospital.latitude),
            Number(hospital.longitude)
          );
      }

      // Same city
      const sameCity =
        donor.city_id ===
        bloodRequest.city_id;

      // Matching score
      const matchingScore =
        calculateMatchingScore({
          distanceKm,
          sameCity,
          donorVerified:
            donor.donor_verified,
          trustScore:
            donor.trust_score,
        });

      matches.push({
        donorId: donor.id,
        bloodGroup:
          donor.blood_group,
        cityId:
          donor.city_id,
        donorVerified:
          donor.donor_verified,
        trustScore:
          donor.trust_score,
        distanceKm,
        matchingScore,
      });
    }

    // 7. Rank donors

    matches.sort(
      (a, b) =>
        b.matchingScore -
        a.matchingScore
    );

    return matches;
  }
}