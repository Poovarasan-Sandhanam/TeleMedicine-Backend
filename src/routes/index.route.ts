// index.ts

import { Router } from "express";
import authRoutes from "./auth/index.route"

const router = Router();

router.use("/auth/", authRoutes);

export default router;