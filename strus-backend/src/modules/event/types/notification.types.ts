/**
 * Event Notification Queue Types
 */

export enum NotificationJobType {
  WORKSPACE_CREATED = "WORKSPACE_CREATED",

  WORKSPACE_DELETED = "WORKSPACE_DELETED",

  WORKSPACE_MEMBER_JOINED = "WORKSPACE_MEMBER_JOINED",

  WORKSPACE_MEMBER_REMOVED = "WORKSPACE_MEMBER_REMOVED",

  WORKSPACE_OWNERSHIP_TRANSFERRED = "WORKSPACE_OWNERSHIP_TRANSFERRED",

}

/**
 * Base payload shared by all notification jobs.
 */
export interface BaseNotificationPayload {
  /**
   * User who triggered the event.
   */
  createdById: string;

  /**
   * Users who should receive the notification.
   */
  recipientIds: string[];
}

/**
 * Workspace created notification payload.
 */
export interface WorkspaceCreatedJobData
  extends BaseNotificationPayload {
  workspaceId: string;

  workspaceName: string;

  workspaceType: string;

  ownerId: string;
}

/**
 * Workspace deleted notification payload.
 */
export interface WorkspaceDeletedJobData
  extends BaseNotificationPayload {
  workspaceId: string;

  workspaceName: string;
}

/**
 * Workspace member joined notification payload.
 *
 * Recipient resolution happens asynchronously.
 */
export interface WorkspaceMemberJoinedJobData {
  createdById: string;

  workspaceId: string;

  joinedUserId: string;
}

/**
 * Workspace member removed notification payload.
 *
 * Recipient resolution happens asynchronously.
 */
export interface WorkspaceMemberRemovedJobData {
  createdById: string;

  workspaceId: string;

  removedUserId: string;
}

export interface WorkspaceOwnershipTransferredJobData {
  workspaceId: string;
  previousOwnerId: string;
  newOwnerId: string;
  createdById: string;
}

/**
 * Notification payload mapping.
 */
export interface NotificationPayloadMap {
  [NotificationJobType.WORKSPACE_CREATED]:
    WorkspaceCreatedJobData;

  [NotificationJobType.WORKSPACE_DELETED]:
    WorkspaceDeletedJobData;

  [NotificationJobType.WORKSPACE_MEMBER_JOINED]:
    WorkspaceMemberJoinedJobData;

  [NotificationJobType.WORKSPACE_MEMBER_REMOVED]:
    WorkspaceMemberRemovedJobData;

  [NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED]:
    WorkspaceOwnershipTransferredJobData;
}

/**
 * Notification queue job.
 */
export type NotificationJob =
  | {
      type: NotificationJobType.WORKSPACE_CREATED;
      payload: WorkspaceCreatedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_DELETED;
      payload: WorkspaceDeletedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_MEMBER_JOINED;
      payload: WorkspaceMemberJoinedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_MEMBER_REMOVED;
      payload: WorkspaceMemberRemovedJobData;
    }
    | {
    type: NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED;
    payload: WorkspaceOwnershipTransferredJobData;
    };

