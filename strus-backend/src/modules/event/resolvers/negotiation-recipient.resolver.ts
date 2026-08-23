import { NegotiationRepository } from "../repositories/negotiation.repository.js";

export class NegotiationRecipientResolver {

  // ======================================================
  // Shared Context
  // ======================================================

  private static async getContext(
    negotiationId: string
  ) {

    const context =
      await NegotiationRepository.getNotificationContext(
        negotiationId
      );

    if (
      !context ||
      !context.project.agreement
    ) {
      return null;
    }

    return context;
  }

  // ======================================================
  // Negotiation Created
  // ======================================================

  static async resolveNegotiationCreated(
    negotiationId: string
  ) {

    const context =
      await this.getContext(
        negotiationId
      );

    if (!context) {
      return null;
    }

    return {

      negotiationId:
        context.id,

      projectId:
        context.projectId,

      projectTitle:
        context.project.title,

      milestoneId:
        context.milestone.id,

      milestoneOrder:
        context.milestone.order,

      agreementParticipantId:
        context.milestone.agreementParticipantId,

      clientRecipientIds: [],

      professionalRecipientIds: [
        context.milestone
          .agreementParticipant.userId,
      ],

    };
  }

  // ======================================================
  // Negotiation Accepted
  // ======================================================

  static async resolveNegotiationAccepted(
    negotiationId: string
  ) {

    const context =
      await this.getContext(
        negotiationId
      );

    if (!context) {
      return null;
    }

    return {

      negotiationId:
        context.id,

      projectId:
        context.projectId,

      projectTitle:
        context.project.title,

      milestoneId:
        context.milestone.id,

      milestoneOrder:
        context.milestone.order,

      agreementParticipantId:
        context.milestone.agreementParticipantId,

      clientRecipientIds: [
        context.project
          .agreement!.createdById,
      ],

      professionalRecipientIds: [],

    };
  }

  // ======================================================
  // Negotiation Declined
  // ======================================================

  static async resolveNegotiationDeclined(
    negotiationId: string
  ) {

    return this.resolveNegotiationAccepted(
      negotiationId
    );
  }

  // ======================================================
  // Negotiation Expired
  // ======================================================

  static async resolveNegotiationExpired(
    negotiationId: string
  ) {

    return this.resolveNegotiationAccepted(
      negotiationId
    );
  }
}