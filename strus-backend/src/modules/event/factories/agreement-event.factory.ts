import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  AgreementCreatedJobData,
  AgreementUpdatedJobData,
  AgreementProfessionalInvitedJobData,
  AgreementInvitationAcceptedJobData,
  AgreementInvitationDeclinedJobData,
  AgreementInvitationWithdrawnJobData,
  AgreementProfessionalRemovedJobData,
} from "../types/notification.types.js";

import { EventService } from "../services/event.service.js";
import { AgreementRecipientResolver } from "../resolvers/agreement-recipient.resolver.js";

export class AgreementNotificationFactory {

  /**
   * Agreement Created
   */
  static async agreementCreated(
    data: AgreementCreatedJobData
  ): Promise<void> {

    const context =
      await AgreementRecipientResolver.resolveAgreementCreated(data);

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.AGREEMENT_CREATED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title: "Agreement Created",

        description:
          `${context.agreementTitle} has been created.`,

        metadata: {

          agreementId: context.agreementId,

          projectId: context.projectId,

          agreementTitle: context.agreementTitle,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.AGREEMENT_CREATED,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title: "Agreement Created",

        description:
          `${context.agreementTitle} has been created.`,

        metadata: {

          agreementId: context.agreementId,

          projectId: context.projectId,

          agreementTitle: context.agreementTitle,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

  /**
   * Agreement Updated
   */
  static async agreementUpdated(
    data: AgreementUpdatedJobData
  ): Promise<void> {

    const context =
      await AgreementRecipientResolver.resolveAgreementUpdated(data);

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.AGREEMENT_UPDATED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title: "Agreement Updated",

        description:
          `${context.agreementTitle} has been updated.`,

        metadata: {

          agreementId: context.agreementId,

          projectId: context.projectId,

          agreementTitle: context.agreementTitle,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.AGREEMENT_UPDATED,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title: "Agreement Updated",

        description:
          `${context.agreementTitle} has been updated.`,

        metadata: {

          agreementId: context.agreementId,

          projectId: context.projectId,

          agreementTitle: context.agreementTitle,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

  /**
   * Professional Invited
   */
  static async professionalInvited(
    data: AgreementProfessionalInvitedJobData
  ): Promise<void> {

    await this.participantEvent(
      EventType.AGREEMENT_PROFESSIONAL_INVITED,
      "Professional Invited",
      "You have been invited to an agreement.",
      data,
      AgreementRecipientResolver.resolveProfessionalInvited
    );

  }

  /**
   * Invitation Accepted
   */
  static async invitationAccepted(
    data: AgreementInvitationAcceptedJobData
  ): Promise<void> {

    await this.participantEvent(
      EventType.AGREEMENT_INVITATION_ACCEPTED,
      "Invitation Accepted",
      "The invitation has been accepted.",
      data,
      AgreementRecipientResolver.resolveInvitationAccepted
    );

  }

  /**
   * Invitation Declined
   */
  static async invitationDeclined(
    data: AgreementInvitationDeclinedJobData
  ): Promise<void> {

    await this.participantEvent(
      EventType.AGREEMENT_INVITATION_DECLINED,
      "Invitation Declined",
      "The invitation has been declined.",
      data,
      AgreementRecipientResolver.resolveInvitationDeclined
    );

  }

  /**
   * Invitation Withdrawn
   */
  static async invitationWithdrawn(
    data: AgreementInvitationWithdrawnJobData
  ): Promise<void> {

    await this.participantEvent(
      EventType.AGREEMENT_INVITATION_WITHDRAWN,
      "Invitation Withdrawn",
      "The invitation has been withdrawn.",
      data,
      AgreementRecipientResolver.resolveInvitationWithdrawn
    );

  }

  /**
   * Professional Removed
   */
  static async professionalRemoved(
    data: AgreementProfessionalRemovedJobData
  ): Promise<void> {

    await this.participantEvent(
      EventType.AGREEMENT_PROFESSIONAL_REMOVED,
      "Professional Removed",
      "You have been removed from the agreement.",
      data,
      AgreementRecipientResolver.resolveProfessionalRemoved
    );

  }

  /**
   * Shared implementation for participant events.
   */
  private static async participantEvent(
    eventType: EventType,
    title: string,
    description: string,
    data: any,
    resolver: (data: any) => Promise<any>
  ): Promise<void> {

    const context = await resolver(data);

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title,

        description,

        metadata: {

          agreementId: context.agreementId,

          agreementTitle: context.agreementTitle,

          projectId: context.projectId,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.AGREEMENT,

        resourceId: context.agreementId,

        title,

        description,

        metadata: {

          agreementId: context.agreementId,

          agreementTitle: context.agreementTitle,

          projectId: context.projectId,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

}