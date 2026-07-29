import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  ExecutionPlanCreatedPayload,
  ExecutionPlanUpdatedPayload,
  ProjectAssetSharedPayload,
  MilestoneStartedPayload,
  SubmissionCreatedPayload,
  RevisionRequestedPayload,
  ExtensionGrantedPayload,
  MilestoneCompletedPayload,
} from "../types/notification.types.js";

import { EventService } from "../services/event.service.js";
import { ExecutionRecipientResolver } from "../resolvers/execution.recipient.resolver.js";

export class ExecutionNotificationFactory {

  /**
   * ======================================================
   * Execution Plan Created
   * ======================================================
   */
  static async executionPlanCreated(
    data: ExecutionPlanCreatedPayload
  ): Promise<void> {

    const context =
      await ExecutionRecipientResolver.resolveExecutionPlanCreatedRecipients(
        data.projectId
      );

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.EXECUTION_PLAN_CREATED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Execution Plan Created",

        description:
          `${context.projectTitle} execution plan has been created.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.EXECUTION_PLAN_CREATED,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Execution Plan Created",

        description:
          `${context.projectTitle} execution plan has been created.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

  /**
   * ======================================================
   * Execution Plan Updated
   * ======================================================
   */
  static async executionPlanUpdated(
    data: ExecutionPlanUpdatedPayload
  ): Promise<void> {

    const context =
      await ExecutionRecipientResolver.resolveExecutionPlanUpdatedRecipients(
        data.projectId
      );

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.EXECUTION_PLAN_UPDATED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Execution Plan Updated",

        description:
          `${context.projectTitle} execution plan has been updated.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.EXECUTION_PLAN_UPDATED,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Execution Plan Updated",

        description:
          `${context.projectTitle} execution plan has been updated.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

  /**
   * ======================================================
   * Project Asset Shared
   * ======================================================
   */
  static async projectAssetShared(
    data: ProjectAssetSharedPayload
  ): Promise<void> {

    const context =
      await ExecutionRecipientResolver.resolveProjectAssetSharedRecipients(
        data.projectAssetId
      );

    if (!context) {
      return;
    }

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.PROJECT_ASSET_SHARED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Project Asset Shared",

        description:
          `A new project asset has been shared in ${context.projectTitle}.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

          projectAssetId: context.projectAssetId,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: EventType.PROJECT_ASSET_SHARED,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.PROJECT,

        resourceId: context.projectId,

        title: "Project Asset Shared",

        description:
          `A new project asset has been shared in ${context.projectTitle}.`,

        metadata: {

          projectId: context.projectId,

          projectTitle: context.projectTitle,

          projectAssetId: context.projectAssetId,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

    /**
   * ======================================================
   * Milestone Started
   * ======================================================
   */
  static async milestoneStarted(
    data: MilestoneStartedPayload
  ): Promise<void> {

    await this.milestoneEvent(

      EventType.MILESTONE_STARTED,

      "Milestone Started",

      "A milestone has been started.",

      data,

      ExecutionRecipientResolver.resolveMilestoneStartedRecipients

    );

  }

  /**
   * ======================================================
   * Submission Created
   * ======================================================
   */
  static async submissionCreated(
    data: SubmissionCreatedPayload
  ): Promise<void> {

    await this.milestoneEvent(

      EventType.SUBMISSION_UNDER_REVIEW,

      "Submission Created",

      "A milestone submission has been created.",

      data,

      ExecutionRecipientResolver.resolveSubmissionCreatedRecipients

    );

  }

  /**
   * ======================================================
   * Revision Requested
   * ======================================================
   */
  static async revisionRequested(
    data: RevisionRequestedPayload
  ): Promise<void> {

    await this.milestoneEvent(

      EventType.REVISION_REQUESTED,

      "Revision Requested",

      "A revision has been requested.",

      data,

      ExecutionRecipientResolver.resolveRevisionRequestedRecipients

    );

  }

  /**
   * ======================================================
   * Extension Granted
   * ======================================================
   */
  static async extensionGranted(
    data: ExtensionGrantedPayload
  ): Promise<void> {

    await this.milestoneEvent(

      EventType.EXTENSION_GRANTED,

      "Extension Granted",

      "A milestone deadline has been extended.",

      data,

      ExecutionRecipientResolver.resolveExtensionGrantedRecipients

    );

  }

  /**
   * ======================================================
   * Milestone Completed
   * ======================================================
   */
  static async milestoneCompleted(
    data: MilestoneCompletedPayload
  ): Promise<void> {

    await this.milestoneEvent(

      EventType.MILESTONE_COMPLETED,

      "Milestone Completed",

      "A milestone has been completed.",

      data,

      ExecutionRecipientResolver.resolveMilestoneCompletedRecipients

    );

  }
  
    /**
   * ======================================================
   * Shared Milestone Event Implementation
   * ======================================================
   */
  private static async milestoneEvent(
    eventType: EventType,
    title: string,
    description: string,
    data: any,
    resolver: (resourceId: string) => Promise<any>
  ): Promise<void> {

    // --------------------------------------------------
    // Resolve Context
    // --------------------------------------------------

    const resourceId =
      data.milestoneId ??
      data.submissionId ??
      data.revisionRequestId ??
      data.extensionId;

    const context = await resolver(resourceId);

    if (!context) {
      return;
    }

    // --------------------------------------------------
    // Client Notification
    // --------------------------------------------------

    if (context.clientRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.MILESTONE,

        resourceId: context.milestoneId,

        title,

        description,

        metadata: {

          milestoneId: context.milestoneId,

          milestoneOrder: context.milestoneOrder,

          agreementParticipantId:
            context.agreementParticipantId,

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.clientRecipientIds,

      });

    }

    // --------------------------------------------------
    // Professional Notification
    // --------------------------------------------------

    if (context.professionalRecipientIds.length > 0) {

      await EventService.createWithoutTransaction({

        type: eventType,

        audience: EventAudience.PROFESSIONAL,

        createdById: data.createdById,

        resourceType: EventResourceType.MILESTONE,

        resourceId: context.milestoneId,

        title,

        description,

        metadata: {

          milestoneId: context.milestoneId,

          milestoneOrder: context.milestoneOrder,

          agreementParticipantId:
            context.agreementParticipantId,

          projectId: context.projectId,

          projectTitle: context.projectTitle,

        },

        recipientIds: context.professionalRecipientIds,

      });

    }

  }

}