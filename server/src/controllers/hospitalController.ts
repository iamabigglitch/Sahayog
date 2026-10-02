import { Request, Response } from "express";
import Hospital from "../models/Hospital";

export const getHospitals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cityId =
      typeof req.query.cityId === "string" ? req.query.cityId : undefined;

    const hospitals = await Hospital.findAll({
      where: cityId ? { city_id: cityId } : undefined,
      order: [["name", "ASC"]],
      raw: true,
    });

    res.status(200).json({
      hospitals: hospitals.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        city_id: hospital.city_id,
      })),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "HOSPITALS_FETCH_FAILED",
        message: error instanceof Error ? error.message : "Failed to fetch hospitals",
      },
    });
  }
};
