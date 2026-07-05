import type {
  WorkspaceInvitation,
  WorkspaceRole,
  WorkspaceInvitationStatus,
} from "../../../generated/prisma/client.js";

import type { WorkspaceInvitationResponse } from "../interfaces/workspace-invitation-response.interface.js";

type WorkspaceInvitationWithRelations =
  WorkspaceInvitation & {
    invitedBy: {
      id: string;
      profile: {
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
      } | null;
    };
  };

export class WorkspaceInvitationMapper {
  static toResponse(
    invitation: WorkspaceInvitationWithRelations
  ): WorkspaceInvitationResponse {
    if (!invitation.invitedBy.profile) {
      throw new Error(
        "Inviter profile not found."
      );
    }

    return {
      id: invitation.id,

      invitedUserId:
        invitation.invitedUserId,

      invitedBy: {
        id: invitation.invitedBy.id,
        username:
          invitation.invitedBy.profile.username,
        firstName:
          invitation.invitedBy.profile.firstName,
        lastName:
          invitation.invitedBy.profile.lastName,
        avatarUrl:
          invitation.invitedBy.profile.avatarUrl,
      },

      status: invitation.status,

      expiresAt: invitation.expiresAt,

      createdAt: invitation.createdAt,
    };
  }

  static toResponseList(
    invitations: WorkspaceInvitationWithRelations[]
  ): WorkspaceInvitationResponse[] {
    return invitations.map((invitation) =>
      this.toResponse(invitation)
    );
  }
}