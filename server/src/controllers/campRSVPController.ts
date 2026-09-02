import { Request, Response } from "express";
import { DonationCampService } from "../services/donationCampService";

export const rsvpToDonationCamp = async (
  req: Request,
  res: Response
) => {
  try {
    const rsvp = await DonationCampService.rsvpToCamp(
      req.user!.userId,
      req.params.id as string
    );

    return res.status(201).json({
      message: "Successfully registered for donation camp",
      rsvp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "RSVP_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to register for donation camp",
      },
    });
  }
};

export const cancelDonationCampRsvp = async (
  req: Request,
  res: Response
) => {
  try {
    const rsvp = await DonationCampService.cancelRsvp(
      req.user!.userId,
      req.params.id as string
    );

    return res.status(200).json({
      message: "RSVP cancelled successfully",
      rsvp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "CANCEL_RSVP_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel RSVP",
      },
    });
  }
};

export const getMyDonationCampRsvps = async (
  req: Request,
  res: Response
) => {
  try {
    const rsvps = await DonationCampService.getMyRsvps(
      req.user!.userId
    );

    return res.status(200).json({
      rsvps,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "MY_RSVPS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch your RSVPs",
      },
    });
  }
};