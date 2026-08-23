import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  NegotiationCreatedJobData,
  NegotiationAcceptedJobData,
  NegotiationDeclinedJobData,
  NegotiationExpiredJobData,
} from "../types/notification.types.js";

import { EventService } from "../services/event.service.js";

import { NegotiationRecipientResolver } from "../resolvers/negotiation-recipient.resolver.js";

// ======================================================
// Negotiation Notification Context
// ======================================================

interface NegotiationNotificationContext {

  negotiationId: string;

  projectId: string;

  projectTitle: string;

  milestoneId: string;

  milestoneOrder: number;

  agreementParticipantId: string;

  clientRecipientIds: string[];

  professionalRecipientIds: string[];

}

export class NegotiationNotificationFactory {

  // ======================================================
  // Negotiation Created
  // ======================================================

  static async negotiationCreated(
    data: NegotiationCreatedJobData
  ): Promise<void> {

    await this.negotiationEvent(

      EventType.NEGOTIATION_CREATED,

      "Negotiation Requested",

      "A new negotiation request has been created.",

      data,

      NegotiationRecipientResolver
        .resolveNegotiationCreated

    );

  }

  // ======================================================
  // Negotiation Accepted
  // ======================================================

  static async negotiationAccepted(
    data: NegotiationAcceptedJobData
  ): Promise<void> {

    await this.negotiationEvent(

      EventType.NEGOTIATION_ACCEPTED,

      "Negotiation Accepted",

      "Your negotiation request has been accepted.",

      data,

      NegotiationRecipientResolver
        .resolveNegotiationAccepted

    );

  }

  // ======================================================
  // Negotiation Declined
  // ======================================================

  static async negotiationDeclined(
    data: NegotiationDeclinedJobData
  ): Promise<void> {

    await this.negotiationEvent(

      EventType.NEGOTIATION_DECLINED,

      "Negotiation Declined",

      "Your negotiation request has been declined.",

      data,

      NegotiationRecipientResolver
        .resolveNegotiationDeclined

    );

  }

  // ======================================================
  // Negotiation Expired
  // ======================================================

  static async negotiationExpired(
    data: NegotiationExpiredJobData
  ): Promise<void> {

    await this.negotiationEvent(

      EventType.NEGOTIATION_EXPIRED,

      "Negotiation Expired",

      "Your negotiation request has expired.",

      data,

      NegotiationRecipientResolver
        .resolveNegotiationExpired

    );

  }

  // ======================================================
  // Shared Negotiation Event Implementation
  // ======================================================

  private static async negotiationEvent(
    eventType: EventType,

    title: string,

    description: string,

    data:
      | NegotiationCreatedJobData
      | NegotiationAcceptedJobData
      | NegotiationDeclinedJobData
      | NegotiationExpiredJobData,

    resolver: (
      negotiationId: string
    ) => Promise<
      NegotiationNotificationContext | null
    >

  ): Promise<void> {

    // --------------------------------------------------
    // Resolve Context
    // --------------------------------------------------

    const context =
      await resolver(
        data.negotiationId
      );

    // --------------------------------------------------
    // No Context
    // --------------------------------------------------

    if (!context) {
      return;
    }

    // --------------------------------------------------
    // Event Description
    // --------------------------------------------------

    let finalDescription =
      description;

    switch (eventType) {

      case EventType.NEGOTIATION_CREATED:

        finalDescription =
          `A negotiation request has been created for ${context.projectTitle}.`;

        break;

      case EventType.NEGOTIATION_ACCEPTED:

        finalDescription =
          `Your negotiation request for ${context.projectTitle} has been accepted.`;

        break;

      case EventType.NEGOTIATION_DECLINED:

        finalDescription =
          `Your negotiation request for ${context.projectTitle} has been declined.`;

        break;

      case EventType.NEGOTIATION_EXPIRED:

        finalDescription =
          `The negotiation request for ${context.projectTitle} has expired.`;

        break;

    }

    // ==================================================
    // Client Notification
    // ==================================================

    if (
      context.clientRecipientIds.length > 0
    ) {

      await EventService.createWithoutTransaction({

        type:
          eventType,

        audience:
          EventAudience.CLIENT,

        createdById:
          data.createdById,

        resourceType:
          EventResourceType.NEGOTIATION,

        resourceId:
          context.negotiationId,

        title,

        description:
          finalDescription,

        metadata: {

          negotiationId:
            context.negotiationId,

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

    // ==================================================
    // Professional Notification
    // ==================================================

    if (
      context.professionalRecipientIds.length > 0
    ) {

      await EventService.createWithoutTransaction({

        type:
          eventType,

        audience:
          EventAudience.PROFESSIONAL,

        createdById:
          data.createdById,

        resourceType:
          EventResourceType.NEGOTIATION,

        resourceId:
          context.negotiationId,

        title,

        description:
          finalDescription,

        metadata: {

          negotiationId:
            context.negotiationId,

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