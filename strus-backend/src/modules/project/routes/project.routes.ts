import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";
import { ProjectController } from "../controllers/project.controller.js";
import { ProjectAuditController } from "../controllers/project-audit.controller.js";

const router = Router();

// ==================================================
// Create Project
// ==================================================

router.post(
  "/workspaces/:workspaceId/projects",
  authenticate,
  ProjectController.create
);

// ==================================================
// Get Project
// ==================================================

router.get(
  "/workspaces/:workspaceId/projects",
  authenticate,
  ProjectController.getAll
);

router.get(
  "/projects/:projectId",
  authenticate,
  ProjectController.getById
);

router.patch(
  "/projects/:projectId",
  authenticate,
  ProjectController.update
);

router.delete(
  "/projects/:projectId",
  authenticate,
  ProjectController.delete
);

router.patch(
  "/projects/:projectId/status",
  authenticate,
  ProjectController.updateStatus
);

router.get(
  "/projects/:projectId/audits",
  authenticate,
  ProjectAuditController.getByProject
);

router.patch(
  "/projects/:projectId/transfer",
  authenticate,
  ProjectController.transfer
);

export default router;