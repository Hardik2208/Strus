export const SOCKET_EVENTS = {
  // Workspace invitations
  INVITATION_CREATED: "workspace.invitation.created",
  INVITATION_CANCELLED: "workspace.invitation.cancelled",
  INVITATION_ACCEPTED: "workspace.invitation.accepted",
  INVITATION_DECLINED: "workspace.invitation.declined",

  // Workspace membership
  MEMBER_JOINED: "workspace.member.joined",
  MEMBER_REMOVED: "workspace.member.removed",
  MEMBER_ROLE_UPDATED: "workspace.member.role.updated",
  OWNERSHIP_TRANSFERRED: "workspace.owner.transferred",

  WORKSPACE_UPDATED: "workspace.updated",
  WORKSPACE_DELETED: "workspace.deleted",
  MEMBER_LEFT: "workspace.member.left",

  // Project
  PROJECT_ACTIVATED: "PROJECT_ACTIVATED",
  PROJECT_COMPLETED: "PROJECT_COMPLETED",

  // Execution
  SUBMISSION_CREATED: "SUBMISSION_CREATED",

    // Agreement
  AGREEMENT_CREATED: "agreement:created",
  AGREEMENT_UPDATED: "agreement:updated",

  AGREEMENT_INVITATION_CREATED: "agreement:invitation:created",
  AGREEMENT_INVITATION_ACCEPTED: "agreement:invitation:accepted",
  AGREEMENT_INVITATION_DECLINED: "agreement:invitation:declined",
  AGREEMENT_INVITATION_WITHDRAWN: "agreement:invitation:withdrawn",

  AGREEMENT_PARTICIPANT_REMOVED: "agreement:participant:removed",

    // Communication
  MESSAGE_SENT: "communication:message:sent",
  MESSAGE_UPDATED: "communication:message:updated",
  MESSAGE_DELETED: "communication:message:deleted",
  MESSAGE_READ: "communication:message:read",

  CONVERSATION_JOINED: "communication:conversation:joined",
  CONVERSATION_LEFT: "communication:conversation:left",

  // Notifications
  NOTIFICATION_RECEIVED: "NOTIFICATION_RECEIVED",
} as const;

export type SocketEventType =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];