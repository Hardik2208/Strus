import { DisputeRepository } from "../repositories/dispute.repository.js";

export class DisputeRecipientResolver {

  // ======================================================
  // Shared Context
  // ======================================================

  private static async getContext(
    disputeId: string
  ) {
    const context =
      await DisputeRepository.getNotificationContext(
        disputeId
      );

    if (
      !context ||
      !context.milestone.project.agreement
    ) {
      return null;
    }

    return context;
  }

  // ======================================================
  // Dispute Created
  // ======================================================

  static async resolveDisputeCreated(
    disputeId: string
  ) {

    const context =
      await this.getContext(
        disputeId
      );

    if (!context || !context.milestone.project.agreement) {
      return null;
    }

    const clientId =
      context.milestone.project
        .agreement.createdById;

    const professionalId =
      context.milestone
        .agreementParticipant.userId;

    const createdByClient =
      context.createdById ===
      clientId;

    return {

      disputeId:
        context.id,

      projectId:
        context.milestone.projectId,

      projectTitle:
        context.milestone.project.title,

      milestoneId:
        context.milestone.id,

      milestoneOrder:
        context.milestone.order,

      agreementParticipantId:
        context.milestone.agreementParticipantId,

      clientRecipientIds:
        createdByClient
          ? []
          : [clientId],

      professionalRecipientIds:
        createdByClient
          ? [professionalId]
          : [],

    };

  }

  // ======================================================
  // Resolution Proposed
  // ======================================================

  static async resolveResolutionProposed(
    disputeId: string
  ) {

    const context =
      await this.getContext(
        disputeId
      );

    if (!context || !context.milestone.project.agreement) {
      return null;
    }

    return {

      disputeId:
        context.id,

      projectId:
        context.milestone.projectId,

      projectTitle:
        context.milestone.project.title,

      milestoneId:
        context.milestone.id,

      milestoneOrder:
        context.milestone.order,

      agreementParticipantId:
        context.milestone.agreementParticipantId,

      clientRecipientIds: [
        context.milestone.project
          .agreement.createdById,
      ],

      professionalRecipientIds: [
        context.milestone
          .agreementParticipant.userId,
      ],

    };

  }

  // ======================================================
  // Dispute Resolved
  // ======================================================

  static async resolveDisputeResolved(
    disputeId: string
  ) {

    return this.resolveResolutionProposed(
      disputeId
    );

  }

  // ======================================================
  // Dispute Closed
  // ======================================================

  static async resolveDisputeClosed(
    disputeId: string
  ) {

    return this.resolveResolutionProposed(
      disputeId
    );

  }

}