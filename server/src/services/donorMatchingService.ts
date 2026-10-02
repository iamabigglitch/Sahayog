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

    const requestStatus = bloodRequest.getDataValue("status");
    const requestExpiresAt = bloodRequest.getDataValue("expires_at");
    const requestHospitalId = bloodRequest.getDataValue("hospital_id");
    const requestCityId = bloodRequest.getDataValue("city_id");
    const requestedBloodGroup = bloodRequest.getDataValue("blood_group_needed");

    // 2. Make sure the request is still active
    if (
      requestStatus !==
      RequestStatus.REQUESTED
    ) {
      throw new Error(
        "This blood request is no longer accepting matches"
      );
    }

    // 3. Check request expiry
    if (
      new Date() >= requestExpiresAt
    ) {
      throw new Error(
        "This blood request has expired"
      );
    }

    // 4. Find the hospital
    const hospital =
      await Hospital.findByPk(
        requestHospitalId
      );

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    const hospitalLatitude = hospital.getDataValue("latitude");
    const hospitalLongitude = hospital.getDataValue("longitude");

    // 5. Get all donor profiles
    const donors =
      await DonorProfile.findAll();

    const matches: MatchedDonor[] = [];

    // 6. Filter and score donors
    for (const donor of donors) {
      const donorBloodGroup = donor.getDataValue("blood_group");
      const donorLatitude = donor.getDataValue("latitude");
      const donorLongitude = donor.getDataValue("longitude");
      const donorCityId = donor.getDataValue("city_id");
      const donorVerified = donor.getDataValue("donor_verified");
      const donorTrustScore = donor.getDataValue("trust_score");

      // Blood compatibility
      const bloodCompatible =
        isBloodGroupCompatible(
          donorBloodGroup,
          requestedBloodGroup
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
        donorLatitude !== undefined &&
        donorLongitude !== undefined &&
        hospitalLatitude !== undefined &&
        hospitalLongitude !== undefined
      ) {
        distanceKm =
          calculateDistanceInKm(
            Number(donorLatitude),
            Number(donorLongitude),
            Number(hospitalLatitude),
            Number(hospitalLongitude)
          );
      }

      // Same city
      const sameCity =
        donorCityId ===
        requestCityId;

      // Matching score
      const matchingScore =
        calculateMatchingScore({
          distanceKm,
          sameCity,
          donorVerified,
          trustScore: donorTrustScore,
        });

      matches.push({
        donorId: donor.getDataValue("id"),
        bloodGroup: donorBloodGroup,
        cityId: donorCityId,
        donorVerified,
        trustScore: donorTrustScore,
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