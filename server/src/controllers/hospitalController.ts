import { Request, Response } from "express";
import Hospital from "../models/Hospital";
import City from "../models/City";

// Public: list hospitals, optionally filtered by city
export const getHospitals = async (req: Request, res: Response): Promise<void> => {
  try {
    const cityId = typeof req.query.cityId === "string" ? req.query.cityId : undefined;

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

// Admin: create a hospital
export const createHospital = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, cityId, address, contactPhone, latitude, longitude } = req.body;

    const city = await City.findByPk(cityId);

    if (!city) {
      res.status(404).json({
        error: { code: "CITY_NOT_FOUND", message: "City not found" },
      });
      return;
    }

    const hospital = await Hospital.create({
      name,
      city_id: cityId,
      address,
      contact_phone: contactPhone,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Hospital created successfully",
      hospital,
    });
  } catch (error) {
    res.status(500).json({
      error: {
        code: "HOSPITAL_CREATE_FAILED",
        message: error instanceof Error ? error.message : "Failed to create hospital",
      },
    });
  }
};