import { Router } from "express";

import { getHospitals, createHospital } from "../controllers/hospitalController";
import { authenticate } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validationMiddleware";
import { createHospitalSchema } from "../schemas/hospitalSchemas";

const router = Router();

// Public
router.get("/", getHospitals);

// Admin
router.post("/", authenticate, requireAdmin, validate(createHospitalSchema), createHospital);

export default router;