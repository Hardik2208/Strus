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
} as const;