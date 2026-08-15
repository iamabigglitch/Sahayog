import { Request, Response } from "express";

import { BloodRequestService } from "../services/bloodRequestService";

export const createBloodRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      bloodGroupNeeded,
      unitsNeeded,
      hospitalId,
      cityId,
      requesterName,
      contactPhone,
      relationshipToPatient,
      urgency,
    } = req.body;

    const bloodRequest =
      await BloodRequestService.createRequest({
        bloodGroupNeeded,
        unitsNeeded,
        hospitalId,
        cityId,
        requesterName,
        contactPhone,
        relationshipToPatient,
        urgency,
      });

    res.status(201).json({
      message: "Blood request created successfully",
      bloodRequest,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "BLOOD_REQUEST_CREATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create blood request",
      },
    });
  }
};