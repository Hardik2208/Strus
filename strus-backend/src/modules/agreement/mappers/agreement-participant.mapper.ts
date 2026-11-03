import type {
  AgreementParticipant,
  User,
  UserProfile,
} from "../../../generated/prisma/client.js";

export class AgreementParticipantMapper {
  // ==================================================
  // Single
  // ==================================================

  static toResponse(
    participant: AgreementParticipant & {
      user?: User & {
        profile: UserProfile | null;
      };
    }
  ) {
    return {
      id: participant.id,

      role: participant.role,

      invitationStatus:
        participant.invitationStatus,

      invitedAt: participant.invitedAt,

      respondedAt:
        participant.respondedAt,

      joinedAt:
        participant.joinedAt,

      createdAt:
        participant.createdAt,

      updatedAt:
        participant.updatedAt,

      user: participant.user
        ? {
            id: participant.user.id,

            email:
              participant.user.email,

            profile:
              participant.user.profile
                ? {
                    username:
                      participant.user.profile
                        .username,

                    firstName:
                      participant.user.profile
                        .firstName,

                    lastName:
                      participant.user.profile
                        .lastName,

                    avatarUrl:
                      participant.user.profile
                        .avatarUrl,
                  }
                : null,
          }
        : null,
    };
  }

  // ==================================================
  // Collection
  // ==================================================

  static toResponseList(
    participants: (
      AgreementParticipant & {
        user?: User & {
          profile: UserProfile | null;
        };
      }
    )[]
  ) {
    return participants.map(
      (participant) =>
        this.toResponse(participant)
    );
  }

  static toInvitationResponse(
  participant: any
) {
  const agreement =
    participant.agreement;

  const project =
    agreement.project;

  const inviter =
    agreement.createdBy;

  const inviterProfile =
    inviter.profile;

  return {
    id: participant.id,

    role: participant.role,

    invitationStatus:
      participant.invitationStatus,

    invitedAt:
      participant.invitedAt,

    respondedAt:
      participant.respondedAt,

    joinedAt:
      participant.joinedAt,

    agreement: {
      id: agreement.id,

      title: agreement.title,

      description:
        agreement.description,

      scope: agreement.scope,

      outOfScope:
        agreement.outOfScope,

      budget:
        agreement.budget,

      expectedDuration:
        agreement.expectedDuration,
    },

    project: {
      id: project.id,

      title: project.title,

      description:
        project.description,

      status:
        project.status,

      setupStage:
        project.setupStage,

      workspaceId:
        project.workspaceId,
    },

    invitedBy: {
      id: inviter.id,

      username:
        inviterProfile?.username ?? null,

      firstName:
        inviterProfile?.firstName ?? null,

      lastName:
        inviterProfile?.lastName ?? null,

      avatarUrl:
        inviterProfile?.avatarUrl ?? null,
    },
  };
}

static toInvitationResponseList(
  participants: any[]
) {
  return participants.map(
    this.toInvitationResponse
  );
}
}