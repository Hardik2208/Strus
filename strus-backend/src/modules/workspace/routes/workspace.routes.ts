import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { WorkspaceController } from "../controllers/workspace.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  WorkspaceController.create
);

router.get(
  "/",
  authenticate,
  WorkspaceController.getAll
);

router.get(
  "/:workspaceId",
  authenticate,
  WorkspaceController.getById
);

router.patch(
  "/:workspaceId",
  authenticate,
  WorkspaceController.update
);

router.delete(
  "/:workspaceId",
  authenticate,
  WorkspaceController.delete
);

router.get(
  "/:workspaceId/members",
  authenticate,
  WorkspaceController.getMembers
);

router.patch(
  "/:workspaceId/members/:memberId",
  authenticate,
  WorkspaceController.updateMemberRole
);

router.post(
  "/:workspaceId/invitations",
  authenticate,
  WorkspaceController.createInvitation
);

router.get(
  "/:workspaceId/invitations",
  authenticate,
  WorkspaceController.getInvitations
);

router.post(
  "/invitations/:invitationId/accept",
  authenticate,
  WorkspaceController.acceptInvitation
);

router.post(
  "/invitations/:invitationId/decline",
  authenticate,
  WorkspaceController.declineInvitation
);

router.delete(
  "/:workspaceId/invitations/:invitationId",
  authenticate,
  WorkspaceController.cancelInvitation
);

router.delete(
  "/:workspaceId/members/:memberId",
  authenticate,
  WorkspaceController.removeMember
);

router.post(
  "/:workspaceId/leave",
  authenticate,
  WorkspaceController.leaveWorkspace
);

router.patch(
  "/:workspaceId/transfer-ownership",
  authenticate,
  WorkspaceController.transferOwnership
);

router.get(
  "/:workspaceId/audit",
  authenticate,
  WorkspaceController.getAuditLogs
);

export { router as workspaceRoutes };