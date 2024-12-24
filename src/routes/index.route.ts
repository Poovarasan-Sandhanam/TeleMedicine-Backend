// index.ts

import { Router } from "express";
import authRoutes from "./auth/index.route"
import profileRoutes from "./profile/profile.route"
import appointmentRoutes from "./appointment/appointment.route"

const router = Router();

router.use("/auth/", authRoutes);
router.use("/profile", profileRoutes);
router.use("/appointment", appointmentRoutes);

export default router;