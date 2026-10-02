import { Router } from "express";
import { getHospitals } from "../controllers/hospitalController";

const router = Router();

router.get("/", getHospitals);

export default router;
