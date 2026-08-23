import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  DisputeCreatedJobData,
  DisputeResolutionProposedJobData,
  DisputeResolvedJobData,
  DisputeClosedJobData,
} from "../types/notification.types.js";

import { EventService } from "../services/event.service.js";

import { DisputeRecipientResolver } from "../resolvers/dispute-recipient.resolver.js";

export class DisputeNotificationFactory {

  /**
   * ======================================================
   * Dispute Created
   * ======================================================
   */
  static async disputeCreated(
    data: DisputeCreatedJobData
  ): Promise<void> {

    await this.disputeEvent(

      EventType.DISPUTE_CREATED,

      "Dispute Created",

      "A dispute has been created.",

      data,

      DisputeRecipientResolver.resolveDisputeCreated

    );

  }

  /**
   * ======================================================
   * Resolution Proposed
   * ======================================================
   */
  static async disputeResolutionProposed(
    data: DisputeResolutionProposedJobData
  ): Promise<void> {

    await this.disputeEvent(

      EventType.DISPUTE_RESOLUTION_PROPOSED,

      "Resolution Proposed",

      "A dispute resolution has been proposed.",

      data,

      DisputeRecipientResolver.resolveResolutionProposed

    );

  }

    /**
   * ======================================================
   * Dispute Resolved
   * ======================================================
   */
  static async disputeResolved(
    data: DisputeResolvedJobData
  ): Promise<void> {

    await this.disputeEvent(

      EventType.DISPUTE_RESOLVED,

      "Dispute Resolved",

      "The dispute has been resolved.",

      data,

      DisputeRecipientResolver.resolveDisputeResolved

    );

  }

  /**
   * ======================================================
   * Dispute Closed
   * ======================================================
   */
  static async disputeClosed(
    data: DisputeClosedJobData
  ): Promise<void> {

    await this.disputeEvent(

      EventType.DISPUTE_CLOSED,

      "Dispute Closed",

      "The dispute has been closed.",

      data,

      DisputeRecipientResolver.resolveDisputeClosed

    );

  }

  /**
   * ======================================================
   * Shared Dispute Event Implementation
   * ======================================================
   */
  private static async disputeEvent(
    eventType: EventType,
    title: string,
    description: string,
    data: any,
    resolver: (
      disputeId: string
    ) => Promise<any>
  ): Promise<void> {

    // --------------------------------------------------
    // Resolve Context
    // --------------------------------------------------

    const context =
      await resolver(
        data.disputeId
      );

    if (!context) {
      return;
    }

    let finalDescription = description;

switch (eventType) {

  case EventType.DISPUTE_CREATED:
    finalDescription =
      `A dispute has been created for ${context.projectTitle}.`;
    break;

  case EventType.DISPUTE_RESOLUTION_PROPOSED:
    finalDescription =
      `A resolution has been proposed for the dispute in ${context.projectTitle}.`;
    break;

  case EventType.DISPUTE_RESOLVED:
    finalDescription =
      `The dispute for ${context.projectTitle} has been resolved.`;
    break;

  case EventType.DISPUTE_CLOSED:
    finalDescription =
      `The dispute for ${context.projectTitle} has been closed.`;
    break;

}

    // --------------------------------------------------
    // Client Notification
    // --------------------------------------------------

    if (
      context.clientRecipientIds.length > 0
    ) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType:
          EventResourceType.DISPUTE,

        resourceId:
          context.disputeId,

        title,

        description: finalDescription,

        metadata: {

          disputeId:
            context.disputeId,

          projectId:
            context.projectId,

          projectTitle:
            context.projectTitle,

          milestoneId:
            context.milestoneId,

          milestoneOrder:
            context.milestoneOrder,

          agreementParticipantId:
            context.agreementParticipantId,

        },

        recipientIds:
          context.clientRecipientIds,

      });

    }

        // --------------------------------------------------
    // Professional Notification
    // --------------------------------------------------

    if (
      context.professionalRecipientIds.length > 0
    ) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience:
          EventAudience.PROFESSIONAL,

        createdById:
          data.createdById,

        resourceType:
          EventResourceType.DISPUTE,

        resourceId:
          context.disputeId,

        title,

        description: finalDescription,

        metadata: {

          disputeId:
            context.disputeId,

          projectId:
            context.projectId,

          projectTitle:
            context.projectTitle,

          milestoneId:
            context.milestoneId,

          milestoneOrder:
            context.milestoneOrder,

          agreementParticipantId:
            context.agreementParticipantId,

        },

        recipientIds:
          context.professionalRecipientIds,

      });

    }

  }

}