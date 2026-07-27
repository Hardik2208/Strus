import type {
  NotificationJob,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

import { WorkspaceNotificationFactory } from "../factories/workspace-event.factory.js";

export class EventProcessor {
  /**
   * Process an incoming notification job.
   */
  static async process(
    job: NotificationJob
  ): Promise<void> {
    switch (job.type) {
      case NotificationJobType.WORKSPACE_CREATED:
        await WorkspaceNotificationFactory.workspaceCreated(
          job.payload
        );
        return;

      case NotificationJobType.WORKSPACE_DELETED:
        await WorkspaceNotificationFactory.workspaceDeleted(
          job.payload
        );
        return;

      case NotificationJobType.WORKSPACE_MEMBER_JOINED:
        await WorkspaceNotificationFactory.workspaceMemberJoined(
          job.payload
        );
        return;

      case NotificationJobType.WORKSPACE_MEMBER_REMOVED:
        await WorkspaceNotificationFactory.workspaceMemberRemoved(
          job.payload
        );
        return;
      
      case NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED:
        await WorkspaceNotificationFactory.workspaceOwnershipTransferred(
          job.payload
        );
        return;
    }
  }
}