// index.ts

import { Router } from "express";
import authRoutes from "./auth/index.route"
import profileRoutes from "./profile/profile.route"

const router = Router();

router.use("/auth/", authRoutes);
router.use("/profile", profileRoutes);

export default router;