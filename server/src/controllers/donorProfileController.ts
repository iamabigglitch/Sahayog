import { Request, Response } from "express";

import { DonorProfileService } from "../services/donorProfileService";

export const getMyProfile = async (
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

    const profile = await DonorProfileService.getMyProfile(
      req.user.userId
    );

    res.status(200).json({
      profile,
    });
  } catch (error) {
    res.status(404).json({
      error: {
        code: "DONOR_PROFILE_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Donor profile not found",
      },
    });
  }
};


export const updateMyProfile = async (
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
      bloodGroup,
      cityId,
      latitude,
      longitude,
      lastDonationDate,
    } = req.body;

    const profile = await DonorProfileService.updateMyProfile(
      req.user.userId,
      {
        bloodGroup,
        cityId,
        latitude,
        longitude,
        lastDonationDate,
      }
    );

    res.status(200).json({
      message: "Donor profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "DONOR_PROFILE_UPDATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update donor profile",
      },
    });
  }
};


export const updateAvailability = async (
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

    const { available } = req.body;

    const profile = await DonorProfileService.updateAvailability(
      req.user.userId,
      available
    );

    res.status(200).json({
      message: "Availability updated successfully",
      profile,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "AVAILABILITY_UPDATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update availability",
      },
    });
  }
};


export const getPublicProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await DonorProfileService.getPublicProfile(
      req.params.id as string
    );

    res.status(200).json({
      profile,
    });
  } catch (error) {
    res.status(404).json({
      error: {
        code: "DONOR_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Donor not found",
      },
    });
  }
};