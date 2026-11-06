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

// ==================================================
// Communication
// ==================================================

MESSAGE_SENT:
  "communication:message:sent",

MESSAGE_UPDATED:
  "communication:message:updated",

MESSAGE_DELETED:
  "communication:message:deleted",

MESSAGE_READ:
  "communication:message:read",

CONVERSATION_JOINED:
  "communication:conversation:joined",

CONVERSATION_LEFT:
  "communication:conversation:left",

// ==================================================
// Negotiation
// ==================================================

NEGOTIATION_ACTION_REQUEST_CREATED:
  "negotiation:action-request:created",

NEGOTIATION_ACCEPTED:
  "negotiation:accepted",

NEGOTIATION_DECLINED:
  "negotiation:declined",

NEGOTIATION_EXPIRED:
  "negotiation:expired",

  WORKSPACE_UPDATED: "workspace.updated",
WORKSPACE_DELETED: "workspace.deleted",
MEMBER_LEFT: "workspace.member.left",

} as const;