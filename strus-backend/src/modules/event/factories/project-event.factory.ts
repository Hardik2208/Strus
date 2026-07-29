import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

import type {
  ProjectActivatedJobData,
  ProjectCompletedJobData,
  ProjectCreatedJobData,
  ProjectDeletedJobData,
  ProjectTransferredJobData,
  ProjectUpdatedJobData,
} from "../types/notification.types.js";

import { EventService } from "../services/event.service.js";
import { ProjectRecipientResolver } from "../resolvers/project-recipient.resolver.js";

export class ProjectNotificationFactory {

  /**
 * Create Project Created notification.
 */
static async projectCreated(
  data: ProjectCreatedJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectCreated(data);

  if (!context) {
    return;
  }

  await EventService.createWithoutTransaction({

    type: EventType.PROJECT_CREATED,

    audience: EventAudience.CLIENT,

    createdById: data.createdById,

    resourceType: EventResourceType.PROJECT,

    resourceId: context.projectId,

    title: "Project Created",

    description:
      `${context.projectTitle} has been created.`,

    metadata: {

      projectId: context.projectId,

      projectTitle: context.projectTitle,

    },

    recipientIds: context.recipientIds,

  });

}

/**
 * Create Project Updated notification.
 */
static async projectUpdated(
  data: ProjectUpdatedJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectUpdated(data);

  if (!context) {
    return;
  }

  /**
   * Client Notification
   */
  if (context.clientRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_UPDATED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Updated",

      description:
        `${context.projectTitle} has been updated.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.clientRecipientIds,

    });

  }

  /**
   * Professional Notification
   */
  if (context.professionalRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_UPDATED,

      audience: EventAudience.PROFESSIONAL,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Updated",

      description:
        `${context.projectTitle} has been updated.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.professionalRecipientIds,

    });

  }

}

/**
 * Create Project Activated notification.
 */
static async projectActivated(
  data: ProjectActivatedJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectActivated(data);

  if (!context) {
    return;
  }

  /**
   * Client Notification
   */
  if (context.clientRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_ACTIVATED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Activated",

      description:
        `${context.projectTitle} is now active.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.clientRecipientIds,

    });

  }

  /**
   * Professional Notification
   */
  if (context.professionalRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_ACTIVATED,

      audience: EventAudience.PROFESSIONAL,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Activated",

      description:
        `${context.projectTitle} is now active.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.professionalRecipientIds,

    });

  }

}

/**
 * Create Project Completed notification.
 */
static async projectCompleted(
  data: ProjectCompletedJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectCompleted(data);

  if (!context) {
    return;
  }

  /**
   * Client Notification
   */
  if (context.clientRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_COMPLETED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Completed",

      description:
        `${context.projectTitle} has been completed.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.clientRecipientIds,

    });

  }

  /**
   * Professional Notification
   */
  if (context.professionalRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_COMPLETED,

      audience: EventAudience.PROFESSIONAL,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Completed",

      description:
        `${context.projectTitle} has been completed.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.professionalRecipientIds,

    });

  }

}

/**
 * Create Project Deleted notification.
 */
static async projectDeleted(
  data: ProjectDeletedJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectDeleted(data);

  if (!context) {
    return;
  }

  /**
   * Client Notification
   */
  if (context.clientRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_DELETED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Deleted",

      description:
        `${context.projectTitle} has been deleted.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.clientRecipientIds,

    });

  }

  /**
   * Professional Notification
   */
  if (context.professionalRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_DELETED,

      audience: EventAudience.PROFESSIONAL,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Deleted",

      description:
        `${context.projectTitle} has been deleted.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

      },

      recipientIds: context.professionalRecipientIds,

    });

  }

}

/**
 * Create Project Ownership Transferred notification.
 */
/**
 * Create Project Transferred notification.
 */
static async projectTransferred(
  data: ProjectTransferredJobData
): Promise<void> {

  const context =
    await ProjectRecipientResolver.resolveProjectTransferred(data);

  if (!context) {
    return;
  }

  /**
   * Project Creator Notification
   */
  await EventService.createWithoutTransaction({

    type: EventType.PROJECT_WORKSPACE_TRANSFERRED,

    audience: EventAudience.CLIENT,

    createdById: data.createdById,

    resourceType: EventResourceType.PROJECT,

    resourceId: context.projectId,

    title: "Project Transferred",

    description:
      "Your project has been transferred to a team workspace.",

    metadata: {

      projectId: context.projectId,

      projectTitle: context.projectTitle,

      previousWorkspaceId:
        data.previousWorkspaceId,

      destinationWorkspaceId:
        data.destinationWorkspaceId,

      direction: "OUTGOING",

    },

    recipientIds: [
      context.createdById,
    ],

  });

  /**
   * Destination Workspace Notification
   */
  if (context.destinationRecipientIds.length > 0) {

    await EventService.createWithoutTransaction({

      type: EventType.PROJECT_WORKSPACE_TRANSFERRED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.PROJECT,

      resourceId: context.projectId,

      title: "Project Transferred",

      description:
        `${context.projectTitle} has been transferred into your workspace.`,

      metadata: {

        projectId: context.projectId,

        projectTitle: context.projectTitle,

        previousWorkspaceId:
          data.previousWorkspaceId,

        destinationWorkspaceId:
          data.destinationWorkspaceId,

        direction: "INCOMING",

      },

      recipientIds:
        context.destinationRecipientIds,

    });

  }

}

}