import BloodRequest from "../models/BloodRequest";
import Hospital from "../models/Hospital";
import City from "../models/City";

import {
  RequestStatus,
  Urgency,
  BloodGroup,
  RelationshipToPatient,
} from "../types/enums";

import { RequestBroadcastService } from "./requestBroadcastService";

export interface CreateBloodRequestData {
  bloodGroupNeeded: BloodGroup;
  unitsNeeded: number;
  hospitalId: string;
  cityId: string;
  requesterName: string;
  contactPhone: string;
  relationshipToPatient: RelationshipToPatient;
  urgency?: Urgency;
}

// How long a request stays open, by urgency (in hours).
// Change these numbers to tune the tiers.
const EXPIRY_HOURS: Record<Urgency, number> = {
  [Urgency.CRITICAL]: 12,
  [Urgency.HIGH]: 24,
  [Urgency.NORMAL]: 48,
};

export class BloodRequestService {
  static async createRequest(data: CreateBloodRequestData) {
    const {
      bloodGroupNeeded,
      unitsNeeded,
      hospitalId,
      cityId,
      requesterName,
      contactPhone,
      relationshipToPatient,
      urgency = Urgency.NORMAL,
    } = data;

    // Check that the city exists
    const city = await City.findByPk(cityId);

    if (!city) {
      throw new Error("City not found");
    }

    // Check that the hospital exists
    const hospital = await Hospital.findByPk(hospitalId);

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // The hospital must belong to the selected city. Read the raw value
    // rather than the shadowed public field on the model instance.
    if (hospital.getDataValue("city_id") !== cityId) {
      throw new Error("Hospital does not belong to the selected city");
    }

    // More urgent requests expire sooner
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS[urgency] * 60 * 60 * 1000);

    const bloodRequest = await BloodRequest.create({
      blood_group_needed: bloodGroupNeeded,
      units_needed: unitsNeeded,
      hospital_id: hospitalId,
      city_id: cityId,
      requester_name: requesterName,
      contact_phone: contactPhone,
      relationship_to_patient: relationshipToPatient,
      urgency,
      status: RequestStatus.REQUESTED,
      trust_score: 0,
      expires_at: expiresAt,
    });

    // Tell nearby donors. The request is already saved at this point, so a problem
    // with notifications is logged instead of making the whole request look failed.
    try {
      await RequestBroadcastService.broadcastRequest(bloodRequest.getDataValue("id"));
    } catch (error) {
      console.error("Could not notify donors for blood request", bloodRequest.getDataValue("id"), error);
    }

    return bloodRequest;
  }

  static async getRequestById(requestId: string) {
    const bloodRequest = await BloodRequest.findByPk(requestId, {
      include: [
        {
          model: Hospital,
          as: "hospital",
          attributes: ["id", "name", "address"],
        },
        {
          model: City,
          as: "city",
          attributes: ["id", "name", "province"],
        },
      ],
    });

    if (!bloodRequest) {
      throw new Error("Blood request not found");
    }

    return bloodRequest;
  }
}