import { Request, Response } from "express";

import {
  RequestResponseService,
} from "../services/requestResponseService";

import { ResponseStatus } from "../types/enums";


export const createRequestResponse = async (
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
      requestId,
    } = req.body;

    const result =
      await RequestResponseService.createResponse({
        requestId,
        userId: req.user.userId,
      });

    res.status(201).json({
      message: "Response created successfully",
      data: result,
    });

  } catch (error) {

    res.status(400).json({
      error: {
        code: "REQUEST_RESPONSE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create request response",
      },
    });

  }
};


export const updateRequestResponseStatus = async (
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

    const responseId = req.params.responseId as string;

    const {
      status,
    } = req.body;

    const result =
      await RequestResponseService.updateResponseStatus(
        responseId,
        req.user.userId,
        status
      );

    res.status(200).json({
      message: "Response status updated successfully",
      data: result,
    });

  } catch (error) {

    res.status(400).json({
      error: {
        code: "REQUEST_RESPONSE_UPDATE_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to update response status",
      },
    });

  }
};