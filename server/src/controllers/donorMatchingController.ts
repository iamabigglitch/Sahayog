import { Request, Response } from "express";

import { DonorMatchingService } from "../services/donorMatchingService";

export const getDonorMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { requestId } = req.params;

    const matches =
      await DonorMatchingService.findMatches(
        requestId as string
      );

    res.status(200).json({
      message: "Donor matches retrieved successfully",
      data: matches,
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: "DONOR_MATCHING_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to find matching donors",
      },
    });
  }
};