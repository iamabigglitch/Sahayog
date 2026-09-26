import { Request, Response } from "express";
import City from "../models/City";

export const getCities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cities = await City.findAll({
      order: [["name", "ASC"]],
    });

    res.status(200).json({ cities });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "CITIES_FETCH_FAILED",
        message: error instanceof Error ? error.message : "Failed to fetch cities",
      },
    });
  }
};