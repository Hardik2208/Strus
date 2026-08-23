import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  ActionRequestCreatedJobData,
  ActionRequestRespondedJobData,
  ActionRequestExpiredJobData,
} from "../types/notification.types.js";

import {
  EventService,
} from "../services/event.service.js";

import {
  ActionRequestRecipientResolver,
} from "../resolvers/action-request-recipient.resolver.js";

export class ActionRequestNotificationFactory {

  // ======================================================
  // Action Request Created
  // ======================================================

  static async actionRequestCreated(
    data: ActionRequestCreatedJobData
  ): Promise<void> {

    await this.actionRequestEvent(

      EventType.ACTION_REQUEST_CREATED,

      "Action Request Created",

      "A new action request has been created.",

      data,

      ActionRequestRecipientResolver
        .resolveActionRequestCreated

    );

  }

  // ======================================================
  // Action Request Responded
  // ======================================================

  static async actionRequestResponded(
    data: ActionRequestRespondedJobData
  ): Promise<void> {

    await this.actionRequestEvent(

      EventType.ACTION_REQUEST_RESPONDED,

      "Action Request Responded",

      "An action request has been responded to.",

      data,

      ActionRequestRecipientResolver
        .resolveActionRequestResponded

    );

  }

  // ======================================================
  // Action Request Expired
  // ======================================================

  static async actionRequestExpired(
    data: ActionRequestExpiredJobData
  ): Promise<void> {

    await this.actionRequestEvent(

      EventType.ACTION_REQUEST_EXPIRED,

      "Action Request Expired",

      "An action request has expired.",

      data,

      ActionRequestRecipientResolver
        .resolveActionRequestExpired

    );

  }

  // ======================================================
  // Shared Action Request Event
  // ======================================================

  private static async actionRequestEvent(
    eventType: EventType,
    title: string,
    description: string,
    data:
      | ActionRequestCreatedJobData
      | ActionRequestRespondedJobData
      | ActionRequestExpiredJobData,
    resolver: (
      actionRequestId: string
    ) => Promise<{
      actionRequestId: string;
      projectId: string;
      projectTitle: string;
      milestoneId: string | null;
      milestoneOrder: number | null;
      clientRecipientIds: string[];
      professionalRecipientIds: string[];
    } | null>
  ): Promise<void> {

    // --------------------------------------------------
    // Resolve Context
    // --------------------------------------------------

    const context =
      await resolver(
        data.actionRequestId
      );

    if (!context) {
      return;
    }

    // --------------------------------------------------
    // Description
    // --------------------------------------------------

    let finalDescription =
      description;

    switch (eventType) {

      case EventType.ACTION_REQUEST_CREATED:

        finalDescription =
          `A new action request has been created for ${context.projectTitle}.`;

        break;

      case EventType.ACTION_REQUEST_RESPONDED:

        finalDescription =
          `An action request for ${context.projectTitle} has been responded to.`;

        break;

      case EventType.ACTION_REQUEST_EXPIRED:

        finalDescription =
          `An action request for ${context.projectTitle} has expired.`;

        break;

    }

    // --------------------------------------------------
    // Shared Metadata
    // --------------------------------------------------

    const metadata = {

      actionRequestId:
        context.actionRequestId,

      projectId:
        context.projectId,

      projectTitle:
        context.projectTitle,

      milestoneId:
        context.milestoneId,

      milestoneOrder:
        context.milestoneOrder,

    };

    // --------------------------------------------------
    // Client Notification
    // --------------------------------------------------

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
          EventResourceType.ACTION_REQUEST,

        resourceId:
          context.actionRequestId,

        title,

        description:
          finalDescription,

        metadata,

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

        type:
          eventType,

        audience:
          EventAudience.PROFESSIONAL,

        createdById:
          data.createdById,

        resourceType:
          EventResourceType.ACTION_REQUEST,

        resourceId:
          context.actionRequestId,

        title,

        description:
          finalDescription,

        metadata,

        recipientIds:
          context.professionalRecipientIds,

      });

    }

  }

}