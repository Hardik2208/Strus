import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { ClientDashboardController } from "../controllers/client-dashboard.controller.js";

const router = Router();

// ==================================================
// Client Dashboard
// ==================================================

router.get(
  "/client-dashboard/overview",
  authenticate,
  ClientDashboardController.getOverview
);

router.get(
  "/client-dashboard/requires-attention",
  authenticate,
  ClientDashboardController.getRequiresAttention
);

router.get(
  "/client-dashboard/recent-activity",
  authenticate,
  ClientDashboardController.getRecentActivity
);

export default router;