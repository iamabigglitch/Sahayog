import { Request, Response } from "express";

import { AdminService } from "../services/adminService";
import {
  CampStatus,
  RequestStatus,
  RSVPStatus,
} from "../types/enums";


// Dashboard
export const getAdminDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await AdminService.getDashboardStats(
      req.user!.userId
    );

    return res.status(200).json({
      stats,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_DASHBOARD_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch admin dashboard",
      },
    });
  }
};

// Donors
export const listAdminDonors = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await AdminService.listDonors(
      req.user!.userId,
      {
        verified:
          typeof req.query.verified === "string"
            ? req.query.verified
            : undefined,

        page:
          typeof req.query.page === "string"
            ? Number(req.query.page)
            : 1,

        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : 20,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_DONOR_LIST_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch donors",
      },
    });
  }
};

export const updateDonorVerification = async (
  req: Request,
  res: Response
) => {
  try {
    const donor = await AdminService.updateDonorVerification(
      req.user!.userId,
      req.params.id as string,
      req.body.verified
    );

    return res.status(200).json({
      message: "Donor verification updated successfully",
      donor,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "DONOR_VERIFICATION_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update donor verification",
      },
    });
  }
};

// Blood requests
export const listAdminBloodRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await AdminService.listBloodRequests(
      req.user!.userId,
      {
        status:
          typeof req.query.status === "string"
            ? (req.query.status as RequestStatus)
            : undefined,

        urgency:
          typeof req.query.urgency === "string"
            ? req.query.urgency
            : undefined,

        cityId:
          typeof req.query.cityId === "string"
            ? req.query.cityId
            : undefined,

        page:
          typeof req.query.page === "string"
            ? Number(req.query.page)
            : 1,

        limit:
          typeof req.query.limit === "string"
            ? Number(req.query.limit)
            : 20,
      }
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_REQUEST_LIST_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch blood requests",
      },
    });
  }
};

export const getAdminBloodRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const request = await AdminService.getBloodRequestById(
      req.user!.userId,
      req.params.id as string
    );

    return res.status(200).json({
      request,
    });
  } catch (error) {
    return res.status(404).json({
      error: {
        code: "ADMIN_REQUEST_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Blood request not found",
      },
    });
  }
};

export const updateAdminBloodRequestStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const request =
      await AdminService.updateBloodRequestStatus(
        req.user!.userId,
        req.params.id as string,
        req.body.status as RequestStatus
      );

    return res.status(200).json({
      message: "Blood request status updated successfully",
      request,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_REQUEST_STATUS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update blood request status",
      },
    });
  }
};

// Donation camps
export const listAdminDonationCamps = async (
  req: Request,
  res: Response
) => {
  try {
    const camps =
      await AdminService.listAllDonationCamps(
        req.user!.userId
      );

    return res.status(200).json({
      camps,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_CAMP_LIST_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch donation camps",
      },
    });
  }
};

export const getAdminDonationCamp = async (
  req: Request,
  res: Response
) => {
  try {
    const camp = await AdminService.getDonationCamp(
      req.user!.userId,
      req.params.id as string
    );

    return res.status(200).json({
      camp,
    });
  } catch (error) {
    return res.status(404).json({
      error: {
        code: "ADMIN_CAMP_NOT_FOUND",
        message:
          error instanceof Error
            ? error.message
            : "Donation camp not found",
      },
    });
  }
};

export const updateAdminDonationCampStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const camp =
      await AdminService.updateDonationCampStatus(
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
        code: "ADMIN_CAMP_STATUS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update donation camp status",
      },
    });
  }
};

// RSVP / attendance
export const listAdminCampRsvps = async (
  req: Request,
  res: Response
) => {
  try {
    const rsvps = await AdminService.listCampRsvps(
      req.user!.userId,
      req.params.id as string
    );

    return res.status(200).json({
      rsvps,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_RSVP_LIST_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch camp RSVPs",
      },
    });
  }
};

export const updateAdminCampRsvpStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const rsvp =
      await AdminService.updateCampRsvpStatus(
        req.user!.userId,
        req.params.id as string,
        req.body.status as RSVPStatus
      );

    return res.status(200).json({
      message: "RSVP status updated successfully",
      rsvp,
    });
  } catch (error) {
    return res.status(400).json({
      error: {
        code: "ADMIN_RSVP_STATUS_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update RSVP status",
      },
    });
  }
};