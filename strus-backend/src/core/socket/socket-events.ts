export const SocketEvents = {
  INVITATION_CREATED:
    "workspace.invitation.created",

  INVITATION_ACCEPTED:
    "workspace.invitation.accepted",

  INVITATION_DECLINED:
    "workspace.invitation.declined",

  INVITATION_CANCELLED:
    "workspace.invitation.cancelled",

  MEMBER_JOINED:
    "workspace.member.joined",

  MEMBER_REMOVED:
    "workspace.member.removed",

  MEMBER_ROLE_UPDATED:
    "workspace.member.role.updated",

  OWNERSHIP_TRANSFERRED:
    "workspace.owner.transferred",

  // ==================================================
// Agreement
// ==================================================

AGREEMENT_INVITATION_ACCEPTED:
  "agreement:invitation:accepted",

AGREEMENT_INVITATION_DECLINED:
  "agreement:invitation:declined",

AGREEMENT_INVITATION_WITHDRAWN:
  "agreement:invitation:withdrawn",

AGREEMENT_PARTICIPANT_REMOVED:
  "agreement:participant:removed",

AGREEMENT_UPDATED:
  "agreement:updated",

AGREEMENT_CREATED:
  "agreement:created",

AGREEMENT_INVITATION_CREATED:
  "agreement:invitation:created",

// ==================================================
// Execution
// ==================================================

SUBMISSION_CREATED:
  "execution:submission:created",

SUBMISSION_APPROVED:
  "execution:submission:approved",

SUBMISSION_REVISION_REQUESTED:
  "execution:submission:revision-requested",

PENDING_REVIEWS_UPDATED:
  "execution:pending-reviews:updated",

} as const;