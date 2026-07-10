import { Router } from "express";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { AgreementController } from "../controllers/agreement.controller.js";
import { AgreementAuditController } from "../controllers/agreement-audit.controller.js";
import { AgreementParticipantController } from "../controllers/agreement-participant.controller.js";

const router = Router();

// ==================================================
// Agreement
// ==================================================

router.post(
  "/projects/:projectId/agreement",
  authenticate,
  AgreementController.create
);

router.get(
  "/projects/:projectId/agreement",
  authenticate,
  AgreementController.get
);

router.patch(
  "/projects/:projectId/agreement",
  authenticate,
  AgreementController.update
);

// ==================================================
// Agreement Participants
// ==================================================

router.get(
  "/projects/:projectId/agreement/participants",
  authenticate,
  AgreementParticipantController.getAll
);

router.post(
  "/projects/:projectId/agreement/participants",
  authenticate,
  AgreementParticipantController.invite
);

router.patch(
  "/projects/:projectId/agreement/participants/:participantId",
  authenticate,
  AgreementParticipantController.updateInvitationStatus
);

router.delete(
  "/projects/:projectId/agreement/participants/:participantId",
  authenticate,
  AgreementParticipantController.remove
);

// ==================================================
// Agreement Audit
// ==================================================

router.get(
  "/projects/:projectId/agreement/audits",
  authenticate,
  AgreementAuditController.getByAgreement
);

// ==================================================
// Withdraw Invitation
// ==================================================

router.patch(
  "/projects/:projectId/agreement/participants/:participantId/withdraw",
  authenticate,
  AgreementParticipantController.withdrawInvitation
);

export default router;