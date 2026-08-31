import {
  Request,
  Response,
} from "express";

import {
  DonationHistoryService,
} from "../services/donationHistoryService";

// Get My Donation History
export const getMyDonationHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message:
            "Authentication required",
        },
      });

      return;
    }

    const history =
      await DonationHistoryService.getMyDonationHistory(
        req.user.userId
      );

    res.status(200).json({
      donationHistory: history,
    });

  } catch (error) {

    res.status(404).json({
      error: {
        code:
          "DONATION_HISTORY_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Donation history not found",
      },
    });
  }
};

// Get One Donation History
export const getDonationHistoryById =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message:
              "Authentication required",
          },
        });

        return;
      }

      const donationId =
        req.params.id;

      const donation =
        await DonationHistoryService.getDonationHistoryById(
          donationId as string,
          req.user.userId
        );

      res.status(200).json({
        donationHistory: donation,
      });

    } catch (error) {

      res.status(404).json({
        error: {
          code:
            "DONATION_HISTORY_NOT_FOUND",
          message:
            error instanceof Error
              ? error.message
              : "Donation history not found",
        },
      });
    }
  };

// Create Donation History
// Admin only
export const createDonationHistory =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        donorId,
        requestId,
        status,
        donationDate,
      } = req.body;

      const donation =
        await DonationHistoryService.createDonationHistory(
          {
            donorId,
            requestId,
            status,
            donationDate,
          }
        );

      res.status(201).json({
        message:
          "Donation history created successfully",
        donationHistory: donation,
      });

    } catch (error) {

      res.status(400).json({
        error: {
          code:
            "DONATION_HISTORY_CREATION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create donation history",
        },
      });
    }
  };


// Update Donation Status
// Admin only
export const updateDonationStatus =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const donationId =
        req.params.id;

      const {
        status,
      } = req.body;

      const donation =
        await DonationHistoryService.updateDonationStatus(
          donationId as string,
          status
        );

      res.status(200).json({
        message:
          "Donation status updated successfully",
        donationHistory: donation,
      });

    } catch (error) {

      res.status(400).json({
        error: {
          code:
            "DONATION_STATUS_UPDATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update donation status",
        },
      });
    }
  };