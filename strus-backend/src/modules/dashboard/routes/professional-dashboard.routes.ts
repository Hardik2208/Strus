import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { ProfessionalDashboardController } from "../controllers/professional-dashboard.controller.js";

const router = Router();

// ==================================================
// Professional Dashboard
// ==================================================

router.get(
  "/overview",
  authenticate,
  ProfessionalDashboardController.getOverview
);

router.get(
  "/active-projects",
  authenticate,
  ProfessionalDashboardController.getActiveProjects
);

router.get(
  "/recent-activity",
  authenticate,
  ProfessionalDashboardController.getRecentActivity
);

router.get(
  "/quick-actions",
  authenticate,
  ProfessionalDashboardController.getQuickActions
);

export default router;