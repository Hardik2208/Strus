import type {
  Agreement,
  AgreementParticipant,
} from "../../../generated/prisma/client.js";

import type {
  AgreementParticipantResponse,
  AgreementResponse,
} from "../interfaces/agreement.interface.js";

export class AgreementMapper {
  static toResponse(
    agreement: Agreement
  ): AgreementResponse {
    return {
      id: agreement.id,

      projectId: agreement.projectId,

      title: agreement.title,

      description:
        agreement.description,

      scope: agreement.scope,

      outOfScope:
        agreement.outOfScope,

      budget:
        agreement.budget.toString(),

      expectedDuration:
        agreement.expectedDuration,

      createdById:
        agreement.createdById,

      lastUpdatedById:
        agreement.lastUpdatedById,

      createdAt:
        agreement.createdAt,

      updatedAt:
        agreement.updatedAt,
    };
  }

  static toResponseList(
    agreements: Agreement[]
  ): AgreementResponse[] {
    return agreements.map(
      this.toResponse
    );
  }

  static toParticipantResponse(
    participant: AgreementParticipant
  ): AgreementParticipantResponse {
    return {
      id: participant.id,

      agreementId:
        participant.agreementId,

      userId:
        participant.userId,

      role:
        participant.role,

      invitationStatus:
        participant.invitationStatus,

      invitedAt:
        participant.invitedAt,

      joinedAt:
        participant.joinedAt,

      createdAt:
        participant.createdAt,

      updatedAt:
        participant.updatedAt,
    };
  }

  static toParticipantResponseList(
    participants: AgreementParticipant[]
  ): AgreementParticipantResponse[] {
    return participants.map(
      this.toParticipantResponse
    );
  }
}