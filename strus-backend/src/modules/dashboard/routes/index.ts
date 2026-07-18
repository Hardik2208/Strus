import { Router } from "express";

import clientDashboardRoutes from "./client-dashboard.routes.js";
import professionalDashboard from "./professional-dashboard.routes.js"

const router = Router();

router.use(
  "/client",
  clientDashboardRoutes
);

router.use(
  "/professional",
  professionalDashboard
);

export default router;