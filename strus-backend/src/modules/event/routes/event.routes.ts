import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { EventController } from "../controllers/event.controller.js";

const router = Router();

// ==================================================
// Dashboard Activities
// ==================================================

router.get(
  "/dashboard/client",
  authenticate,
  EventController.getClientDashboardActivities
);

router.get(
  "/dashboard/professional",
  authenticate,
  EventController.getProfessionalDashboardActivities
);

export default router;