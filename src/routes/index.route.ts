// index.ts

import {Router} from "express";
import authRoutes from "./auth/index.route"
import profileRoutes from "./profile/profile.route"
import appointmentRoutes from "./appointment/appointment.route"
import paymentRoutes from "./payment/payment.route"
import prescriptionRoutes from "./prescription/prescription.route"

const router = Router();

router.use("/auth/", authRoutes);
router.use("/profile", profileRoutes);
router.use("/appointment", appointmentRoutes);
router.use("/payment", paymentRoutes);
router.use("/prescription", prescriptionRoutes);

export default router;