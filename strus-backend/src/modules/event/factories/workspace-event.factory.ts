import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";
import type {
    WorkspaceMemberJoinedJobData,
} from "../types/notification.types.js";
import { EventService } from "../services/event.service.js";
import { WorkspaceRecipientResolver } from "../resolvers/workspace-recipient.resolver.js";
import type { WorkspaceCreatedJobData } from "../types/notification.types.js";
import type {
  WorkspaceDeletedJobData,
  WorkspaceOwnershipTransferredJobData,
  WorkspaceMemberLeftJobData,
} from "../types/notification.types.js";
import type {
  WorkspaceMemberRemovedJobData,
} from "../types/notification.types.js";

export class WorkspaceNotificationFactory {
  /**
   * Create Workspace Created notifications.
   */
  static async workspaceCreated(
    data: WorkspaceCreatedJobData
  ): Promise<void> {
    if (data.recipientIds.length === 0) {
      return;
    }

    await EventService.createWithoutTransaction({
      type: EventType.WORKSPACE_CREATED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.WORKSPACE,

      resourceId: data.workspaceId,

      title: "Workspace Created",

      description: `${data.workspaceName} has been created.`,

      metadata: {
        workspaceId: data.workspaceId,
        workspaceName: data.workspaceName,
        workspaceType: data.workspaceType,
        ownerId: data.ownerId,
      },

      recipientIds: data.recipientIds,
    });
  }

  static async workspaceDeleted(
    data: WorkspaceDeletedJobData
): Promise<void> {

    if (data.recipientIds.length === 0) {
        return;
    }

    await EventService.createWithoutTransaction({
        type: EventType.WORKSPACE_DELETED,

        audience: EventAudience.CLIENT,

        createdById: data.createdById,

        resourceType: EventResourceType.WORKSPACE,

        resourceId: data.workspaceId,

        title: "Workspace Deleted",

        description: `${data.workspaceName} has been deleted.`,

        metadata: {
            workspaceId: data.workspaceId,
            workspaceName: data.workspaceName,
        },

        recipientIds: data.recipientIds,
    });
}

static async workspaceMemberJoined(
    data: WorkspaceMemberJoinedJobData
  ): Promise<void> {

    const context =
      await WorkspaceRecipientResolver.resolveWorkspaceMemberJoined(
        data.workspaceId,
        data.joinedUserId
      );

    if (!context) {
      return;
    }

    //
    // Notify the joined member
    //

    await EventService.createWithoutTransaction({

      type: EventType.WORKSPACE_MEMBER_JOINED,

      audience: EventAudience.CLIENT,

      createdById: data.createdById,

      resourceType: EventResourceType.WORKSPACE,

      resourceId: context.workspaceId,

      title: "Welcome to Workspace",

      description:
        `You joined ${context.workspaceName}.`,

      metadata: {

        workspaceId: context.workspaceId,

      },

      recipientIds: [
        context.joinedUserId,
      ],

    });

  }

/**
 * Create Workspace Member Removed notifications.
 */
static async workspaceMemberRemoved(
  data: WorkspaceMemberRemovedJobData
): Promise<void> {

  const context =
    await WorkspaceRecipientResolver.resolveWorkspaceMemberRemoved(
      data.workspaceId,
      data.removedUserId
    );

  if (!context) {
    return;
  }

  //
  // Notify removed member
  //

  await EventService.createWithoutTransaction({

    type: EventType.WORKSPACE_MEMBER_REMOVED,

    audience: EventAudience.CLIENT,

    createdById: data.createdById,

    resourceType: EventResourceType.WORKSPACE,

    resourceId: context.workspaceId,

    title: "Removed from Workspace",

    description:
      `You were removed from ${context.workspaceName}.`,

    metadata: {

      workspaceId: context.workspaceId,

    },

    recipientIds: [
      context.removedUserId,
    ],

  });

}

static async workspaceMemberLeft(
  data: WorkspaceMemberLeftJobData
): Promise<void> {

  const context =
    await WorkspaceRecipientResolver.resolveWorkspaceMemberLeft(
      data.workspaceId,
      data.leftUserId
    );

  if (!context) {
    return;
  }

  await EventService.createWithoutTransaction({

    type: EventType.WORKSPACE_MEMBER_LEFT,

    audience: EventAudience.CLIENT,

    createdById: data.createdById,

    resourceType: EventResourceType.WORKSPACE,

    resourceId: context.workspaceId,

    title: "Left Workspace",

    description:
      `You left ${context.workspaceName}.`,

    metadata: {

      workspaceId: context.workspaceId,

    },

    recipientIds: [
      context.leftUserId,
    ],

  });

}

static async workspaceOwnershipTransferred(
  data: WorkspaceOwnershipTransferredJobData
): Promise<void> {

  const context =
    await WorkspaceRecipientResolver.resolveWorkspaceOwnershipTransferred(
      data.workspaceId,
      data.previousOwnerId,
      data.newOwnerId
    );

  if (!context) {
    return;
  }

  await EventService.createWithoutTransaction({

    type: EventType.WORKSPACE_OWNERSHIP_TRANSFERRED,

    audience: EventAudience.CLIENT,

    createdById: data.createdById,

    resourceType: EventResourceType.WORKSPACE,

    resourceId: context.workspaceId,

    title: "Workspace Ownership Transferred",

    description:
      `${context.previousOwnerName} transferred ownership of ${context.workspaceName} to ${context.newOwnerName}.`,

    metadata: {

      workspaceId: context.workspaceId,

      previousOwnerId: context.previousOwnerId,

      previousOwnerName: context.previousOwnerName,

      newOwnerId: context.newOwnerId,

      newOwnerName: context.newOwnerName,

    },

    recipientIds: context.recipientIds,

  });

}
}