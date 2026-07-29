import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import type  {
  NotificationJob,
  WorkspaceCreatedJobData,
  WorkspaceMemberRemovedJobData,
} from "../types/notification.types.js";
import {
  NotificationJobType,
} from "../types/notification.types.js";
import type { WorkspaceDeletedJobData } from "../types/notification.types.js";
import type {
    WorkspaceMemberJoinedJobData,
} from "../types/notification.types.js";
import type {
  WorkspaceOwnershipTransferredJobData,
} from "../types/notification.types.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";
import type {
  WorkspaceMemberLeftJobData,
} from "../types/notification.types.js";

export class WorkspacePublisher {
  /**
   * Publish Workspace Created notification.
   */
  static async publishWorkspaceCreated(
    payload: WorkspaceCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {
    const job: NotificationJob = {
      type: NotificationJobType.WORKSPACE_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );
  }

  static async publishWorkspaceDeleted(
  payload: WorkspaceDeletedJobData,
  options?: JobsOptions
): Promise<void> {
  const job: NotificationJob = {
    type: NotificationJobType.WORKSPACE_DELETED,
    payload,
  };

  await eventQueue.add(
    JOB_NAMES.CREATE_EVENT,
    job,
    options
  );
}

/**
 * Publish Workspace Member Joined notification.
 */
static async publishWorkspaceMemberJoined(
    payload: WorkspaceMemberJoinedJobData,
    options?: JobsOptions
): Promise<void> {

    const job: NotificationJob = {
        type: NotificationJobType.WORKSPACE_MEMBER_JOINED,
        payload,
    };

    await eventQueue.add(
        JOB_NAMES.CREATE_EVENT,
        job,
        options
    );
}

/**
 * Publish Workspace Member Removed notification.
 */
static async publishWorkspaceMemberRemoved(
    payload: WorkspaceMemberRemovedJobData,
    options?: JobsOptions
): Promise<void> {

    const job: NotificationJob = {
        type: NotificationJobType.WORKSPACE_MEMBER_REMOVED,
        payload,
    };

    await eventQueue.add(
       JOB_NAMES.CREATE_EVENT,
        job,
        options
    );
}

/**
 * Publish Workspace Ownership Transferred notification.
 */
static async publishWorkspaceOwnershipTransferred(
  payload: WorkspaceOwnershipTransferredJobData,
  options?: JobsOptions
): Promise<void> {

  const job: NotificationJob = {
    type: NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED,
    payload,
  };

  await eventQueue.add(
    JOB_NAMES.CREATE_EVENT,
    job,
    options
  );

}

/**
 * Publish Workspace Member Left notification.
 */
static async publishWorkspaceMemberLeft(
  payload: WorkspaceMemberLeftJobData,
  options?: JobsOptions
): Promise<void> {

  const job: NotificationJob = {
    type: NotificationJobType.WORKSPACE_MEMBER_LEFT,
    payload,
  };

  await eventQueue.add(
    JOB_NAMES.CREATE_EVENT,
    job,
    options
  );

}
}