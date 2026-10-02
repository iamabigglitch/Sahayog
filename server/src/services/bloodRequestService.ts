import BloodRequest from "../models/BloodRequest";
import Hospital from "../models/Hospital";
import City from "../models/City";

import {
  RequestStatus,
  Urgency,
  BloodGroup,
  RelationshipToPatient,
} from "../types/enums";

import {
  RequestBroadcastService,
} from "./requestBroadcastService";

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

export class BloodRequestService {

  static async createRequest(
    data: CreateBloodRequestData
  ) {
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
    const hospital =
      await Hospital.findByPk(hospitalId);

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // Make sure the hospital belongs
    // to the selected city. Use the Sequelize raw value rather than
    // the shadowed public field on the model instance.
    const hospitalCityId = hospital.getDataValue("city_id");

    if (hospitalCityId !== cityId) {
      throw new Error(
        "Hospital does not belong to the selected city"
      );
    }

    // Blood requests expire after 48 hours
    const expiresAt = new Date();

    expiresAt.setHours(
      expiresAt.getHours() + 48
    );

    // Create the blood request
    const bloodRequest =
      await BloodRequest.create({
        blood_group_needed:
          bloodGroupNeeded,

        units_needed:
          unitsNeeded,

        hospital_id:
          hospitalId,

        city_id:
          cityId,

        requester_name:
          requesterName,

        contact_phone:
          contactPhone,

        relationship_to_patient:
          relationshipToPatient,

        urgency,

        status:
          RequestStatus.REQUESTED,

        trust_score: 0,

        expires_at:
          expiresAt,
      });

    // Broadcast the request
    // to suitable donors.
    const requestId = bloodRequest.getDataValue("id");
    await RequestBroadcastService
      .broadcastRequest(requestId);

    return bloodRequest;
  }
}
