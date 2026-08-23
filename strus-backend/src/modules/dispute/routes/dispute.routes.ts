import { Router } from "express";

import {
  authenticate,
} from "../../auth/middleware/auth.middleware.js";

import {
  DisputeController,
} from "../controllers/dispute.controller.js";

const router = Router();

// ==================================================
// Create Dispute
// ==================================================

router.post(
  "/milestones/:milestoneId",
  authenticate,
  DisputeController.create
);

// ==================================================
// Get Dispute
// ==================================================

router.get(
  "/:disputeId",
  authenticate,
  DisputeController.getById
);

// ==================================================
// Get Milestone Dispute
// ==================================================

router.get(
  "/milestones/:milestoneId",
  authenticate,
  DisputeController.getByMilestone
);

export {
  router as disputeRoutes,
};