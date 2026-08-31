import { Request, Response } from "express";

import {
  BloodBankStatusService,
} from "../services/bloodBankStatusService";

import {
  BloodGroup,
} from "../types/enums";

// Admin: Create / update blood bank status

export const upsertBloodBankStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });

      return;
    }

    const {
      hospitalId,
      bloodGroup,
      unitsAvailable,
      status,
    } = req.body;

    const result =
      await BloodBankStatusService.upsertStatus(
        req.user.userId,
        {
          hospitalId,
          bloodGroup,
          unitsAvailable,
          status,
        }
      );

    res.status(200).json({
      message:
        "Blood bank status updated successfully",
      bloodBankStatus: result,
    });

  } catch (error) {
    res.status(400).json({
      error: {
        code:
          "BLOOD_BANK_STATUS_UPDATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update blood bank status",
      },
    });
  }
};


// Public: Get all hospital blood statuses
export const getAllBloodBankStatuses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const statuses =
      await BloodBankStatusService.getAllStatuses();

    res.status(200).json({
      bloodBankStatuses: statuses,
    });

  } catch (error) {
    res.status(500).json({
      error: {
        code:
          "BLOOD_BANK_STATUS_FETCH_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch blood bank statuses",
      },
    });
  }
};


// Public: Get all statuses for one hospital
export const getHospitalBloodBankStatuses =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const hospitalId =
        req.params.hospitalId as string;

      const statuses =
        await BloodBankStatusService
          .getHospitalStatuses(
            hospitalId
          );

      res.status(200).json({
        bloodBankStatuses: statuses,
      });

    } catch (error) {
      res.status(404).json({
        error: {
          code:
            "HOSPITAL_BLOOD_BANK_STATUS_NOT_FOUND",
          message:
            error instanceof Error
              ? error.message
              : "Hospital blood bank status not found",
        },
      });
    }
  };


// Public: Get one blood group status
export const getHospitalBloodGroupStatus =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const hospitalId =
        req.params.hospitalId as string;

      const bloodGroup =
        req.params.bloodGroup as BloodGroup;

      const status =
        await BloodBankStatusService
          .getHospitalBloodGroupStatus(
            hospitalId,
            bloodGroup
          );

      res.status(200).json({
        bloodBankStatus: status,
      });

    } catch (error) {
      res.status(404).json({
        error: {
          code:
            "BLOOD_BANK_STATUS_NOT_FOUND",
          message:
            error instanceof Error
              ? error.message
              : "Blood bank status not found",
        },
      });
    }
  };