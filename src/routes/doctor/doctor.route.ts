import { Router } from "express";
import { getDoctorTypes, addDoctorType } from "../../controllers/doctor.controller";

const router = Router();

// Public: Get all doctor types
router.get("/", getDoctorTypes);

// Admin-only: Add a new doctor type
router.post("/", addDoctorType);

export default router;
