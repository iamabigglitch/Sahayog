import BloodBankStatus from "../models/BloodBankStatus";
import Hospital from "../models/Hospital";
import User from "../models/User";

import { BloodGroup, BloodStockStatus, UserRole } from "../types/enums";

export interface UpsertBloodBankStatusData {
  hospitalId: string;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  status: BloodStockStatus;
}

// Hospital fields returned with every status row.
// The alias must match the association declared in models/index.ts.
const hospitalInclude = {
  model: Hospital,
  as: "hospital",
  attributes: ["id", "name", "address", "contact_phone", "city_id"],
};

export class BloodBankStatusService {
  // Create or update the latest confirmed status (admin only)
  static async upsertStatus(userId: string, data: UpsertBloodBankStatusData) {
    const { hospitalId, bloodGroup, unitsAvailable, status } = data;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new Error("Only administrators can update blood bank status");
    }

    const hospital = await Hospital.findByPk(hospitalId);

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    // Make sure status and units make sense
    if (status === BloodStockStatus.OUT_OF_STOCK && unitsAvailable !== 0) {
      throw new Error("Units available must be 0 when blood status is out of stock");
    }

    if (status === BloodStockStatus.AVAILABLE && unitsAvailable === 0) {
      throw new Error("Units available must be greater than 0 when blood status is available");
    }

    const existingStatus = await BloodBankStatus.findOne({
      where: { hospital_id: hospitalId, blood_group: bloodGroup },
    });

    if (existingStatus) {
      await existingStatus.update({
        units_available: unitsAvailable,
        status,
        last_confirmed: new Date(),
        submitted_by: userId,
      });

      return existingStatus;
    }

    return BloodBankStatus.create({
      hospital_id: hospitalId,
      blood_group: bloodGroup,
      units_available: unitsAvailable,
      status,
      last_confirmed: new Date(),
      submitted_by: userId,
    });
  }

  // Get all blood bank statuses
  static async getAllStatuses() {
    return BloodBankStatus.findAll({
      include: [hospitalInclude],
      order: [["last_confirmed", "DESC"]],
    });
  }

  // Get blood bank status for one hospital
  static async getHospitalStatuses(hospitalId: string) {
    const hospital = await Hospital.findByPk(hospitalId);

    if (!hospital) {
      throw new Error("Hospital not found");
    }

    return BloodBankStatus.findAll({
      where: { hospital_id: hospitalId },
      include: [hospitalInclude],
      order: [["blood_group", "ASC"]],
    });
  }

  // Get one blood group status at one hospital
  static async getHospitalBloodGroupStatus(hospitalId: string, bloodGroup: BloodGroup) {
    const status = await BloodBankStatus.findOne({
      where: { hospital_id: hospitalId, blood_group: bloodGroup },
      include: [hospitalInclude],
    });

    if (!status) {
      throw new Error("Blood bank status not found");
    }

    return status;
  }
}