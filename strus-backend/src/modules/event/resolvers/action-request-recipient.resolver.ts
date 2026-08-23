import {
  ActionRequestHelperRepository,
} from "../repositories/action-request-helper.repository.js";

import {
  AgreementParticipantRole,
} from "../../../generated/prisma/enums.js";

export class ActionRequestRecipientResolver {

  // ======================================================
  // Shared Context
  // ======================================================

  private static async getContext(
    actionRequestId: string
  ) {

    const actionRequest =
      await ActionRequestHelperRepository
        .getNotificationContext(
          actionRequestId
        );

    if (!actionRequest) {
      return null;
    }

    return actionRequest;

  }

  // ======================================================
  // Action Request Created
  // ======================================================

  static async resolveActionRequestCreated(
    actionRequestId: string
  ) {

    const context =
      await this.getContext(
        actionRequestId
      );

    if (!context) {
      return null;
    }

    return this.buildContext(
      context
    );

  }

  // ======================================================
  // Action Request Responded
  // ======================================================

  static async resolveActionRequestResponded(
    actionRequestId: string
  ) {

    const context =
      await this.getContext(
        actionRequestId
      );

    if (!context) {
      return null;
    }

    return this.buildContext(
      context
    );

  }

  // ======================================================
  // Action Request Expired
  // ======================================================

  static async resolveActionRequestExpired(
    actionRequestId: string
  ) {

    const context =
      await this.getContext(
        actionRequestId
      );

    if (!context) {
      return null;
    }

    return this.buildContext(
      context
    );

  }

  // ======================================================
  // Build Notification Context
  // ======================================================

  private static buildContext(
    context: Awaited<
      ReturnType<
        typeof ActionRequestHelperRepository
          .getNotificationContext
      >
    >
  ) {

    if (!context) {
      return null;
    }

    // --------------------------------------------------
    // Resolve Project
    // --------------------------------------------------

    const project =
      context.negotiation?.project ??
      context.disputeResult?.dispute?.milestone.project;

    if (!project) {
      return null;
    }

    // --------------------------------------------------
    // Resolve Milestone
    // --------------------------------------------------

    const milestone =
      context.negotiation?.milestone ??
      context.disputeResult?.dispute?.milestone;

    // --------------------------------------------------
    // Resolve Agreement
    // --------------------------------------------------

    const agreement =
      project.agreement;

    if (!agreement) {
      return null;
    }

    // --------------------------------------------------
    // Action Request Participants
    //
    // These are the actual users involved in this
    // Action Request.
    // --------------------------------------------------

    const participantUserIds =
      new Set(
        context.participants.map(
          (participant) =>
            participant.userId
        )
      );

    // --------------------------------------------------
    // Resolve Their Agreement Roles
    // --------------------------------------------------

    const agreementParticipants =
      agreement.participants.filter(
        (participant) =>
          participantUserIds.has(
            participant.userId
          )
      );

    // --------------------------------------------------
    // Client Recipients
    // --------------------------------------------------

    const clientRecipientIds =
      agreementParticipants
        .filter(
          (participant) =>
            participant.role ===
            AgreementParticipantRole.CLIENT
        )
        .map(
          (participant) =>
            participant.userId
        );

    // --------------------------------------------------
    // Professional Recipients
    // --------------------------------------------------

    const professionalRecipientIds =
      agreementParticipants
        .filter(
          (participant) =>
            participant.role ===
            AgreementParticipantRole.PROFESSIONAL
        )
        .map(
          (participant) =>
            participant.userId
        );

    // --------------------------------------------------
    // Final Context
    // --------------------------------------------------

    return {

      actionRequestId:
        context.id,

      projectId:
        project.id,

      projectTitle:
        project.title,

      milestoneId:
        milestone?.id ?? null,

      milestoneOrder:
        milestone?.order ?? null,

      clientRecipientIds,

      professionalRecipientIds,

    };

  }

}