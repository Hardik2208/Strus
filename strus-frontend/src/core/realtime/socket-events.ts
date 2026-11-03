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

  // Agreement invitations
  AGREEMENT_INVITATION_CREATED: "agreement:invitation:created",

  // Notifications
  NOTIFICATION_RECEIVED: "NOTIFICATION_RECEIVED",
} as const;

export type SocketEventType =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];