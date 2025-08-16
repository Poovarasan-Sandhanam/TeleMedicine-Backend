import { Router } from "express";
import { getDoctorTypes } from "../../controllers/doctor.controller";

const router = Router();

// Public: Get all doctor types
router.get("/getDoctorTypes", getDoctorTypes);

export default router;
