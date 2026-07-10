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
}