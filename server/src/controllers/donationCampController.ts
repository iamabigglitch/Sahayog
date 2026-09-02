import { Request, Response } from "express";
import { DonationCampService } from "../services/donationCampService";
import { CampStatus } from "../types/enums";

export const createDonationCamp = async (
  req: Request,
  res: Response
) => {
  try {
    const camp = await DonationCampService.createCamp(
      req.user!.userId,
      req.body
    );

    return res.status(201).json({
      message: "Donation camp created successfully",
      camp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "CREATE_CAMP_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create donation camp",
      },
    });
  }
};

export const updateDonationCamp = async (
  req: Request,
  res: Response
) => {
  try {
    const camp = await DonationCampService.updateCamp(
      req.user!.userId,
      req.params.id as string,
      req.body
    );

    return res.status(200).json({
      message: "Donation camp updated successfully",
      camp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "UPDATE_CAMP_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update donation camp",
      },
    });
  }
};

export const updateDonationCampStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const camp = await DonationCampService.updateCampStatus(
      req.user!.userId,
      req.params.id as string,
      req.body.status as CampStatus
    );

    return res.status(200).json({
      message: "Donation camp status updated successfully",
      camp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "UPDATE_CAMP_STATUS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update camp status",
      },
    });
  }
};

export const listDonationCamps = async (
  req: Request,
  res: Response
) => {
  try {
    const camps = await DonationCampService.listCamps({
      cityId:
        typeof req.query.cityId === "string"
          ? req.query.cityId
          : undefined,

      status:
        typeof req.query.status === "string"
          ? (req.query.status as CampStatus)
          : undefined,
    });

    return res.status(200).json({
      camps,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "LIST_CAMPS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch donation camps",
      },
    });
  }
};

export const getDonationCamp = async (
  req: Request,
  res: Response
) => {
  try {
    const camp = await DonationCampService.getCampById(
      req.params.id as string
    );

    return res.status(200).json({
      camp,
    });
  } catch (error) {
    return res.status(404).json({
      error: {
        code: "CAMP_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Donation camp not found",
      },
    });
  }
};