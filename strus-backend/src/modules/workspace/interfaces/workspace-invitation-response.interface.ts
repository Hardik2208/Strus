import type { WorkspaceInvitationStatus } from "../../../generated/prisma/enums.js";

export interface WorkspaceInvitationResponse {
  id: string;

  invitedUserId: string;

  invitedBy: {
    id: string;

    username: string;

    firstName: string;

    lastName: string;

    avatarUrl: string | null;
  };

  status: WorkspaceInvitationStatus;

  expiresAt: Date;

  createdAt: Date;
}