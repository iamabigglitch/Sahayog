import { Request, Response } from "express";

import {
  RequestResponseService,
} from "../services/requestResponseService";


export const createRequestResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      requestId,
      donorId,
    } = req.body;

    const result =
      await RequestResponseService.createResponse({
        requestId,
        donorId,
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