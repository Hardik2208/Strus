import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { NegotiationController } from "../controllers/negotiation.controller.js";

const router = Router();

// ==================================================
// Negotiations
// ==================================================

router.post(
  "/milestones/:milestoneId/negotiations",
  authenticate,
  NegotiationController.createNegotiation
);

router.get(
  "/milestones/:milestoneId/negotiations",
  authenticate,
  NegotiationController.getNegotiations
);

router.get(
  "/:negotiationId",
  authenticate,
  NegotiationController.getNegotiation
);

router.patch(
  "/:negotiationId/accept",
  authenticate,
  NegotiationController.acceptNegotiation
);

router.patch(
  "/:negotiationId/decline",
  authenticate,
  NegotiationController.declineNegotiation
);

export { router as negotiationRoutes };