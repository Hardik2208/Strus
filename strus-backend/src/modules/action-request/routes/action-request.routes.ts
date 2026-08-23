import { Router } from "express";

import {
  ActionRequestController,
} from "../controllers/action-request.controller.js";

import {
  authenticate,
} from "../../auth/middleware/auth.middleware.js";

import {
  respondActionRequestSchema,
} from "../dtos/respond-action-request.dto.js";

const router =
  Router();

// ==================================================
// Respond To Action Request
// ==================================================

router.post(
  "/:actionRequestId/respond",
  authenticate,
  ActionRequestController.respond
);

export default router;