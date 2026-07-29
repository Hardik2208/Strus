import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,
  ProjectActivatedJobData,
  ProjectCompletedJobData,
  ProjectCreatedJobData,
  ProjectDeletedJobData,
  ProjectTransferredJobData,
  ProjectUpdatedJobData,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class ProjectPublisher {

  /**
   * Publish Project Created notification.
   */
  static async publishProjectCreated(
    payload: ProjectCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Project Updated notification.
   */
  static async publishProjectUpdated(
    payload: ProjectUpdatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_UPDATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Project Activated notification.
   */
  static async publishProjectActivated(
    payload: ProjectActivatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_ACTIVATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Project Completed notification.
   */
  static async publishProjectCompleted(
    payload: ProjectCompletedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_COMPLETED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Project Deleted notification.
   */
  static async publishProjectDeleted(
    payload: ProjectDeletedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_DELETED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
 * Publish Project Transferred notification.
 */
static async publishProjectTransferred(
  payload: ProjectTransferredJobData,
  options?: JobsOptions
): Promise<void> {

  const job: NotificationJob = {
    type: NotificationJobType.PROJECT_TRANSFERRED,
    payload,
  };

  await eventQueue.add(
    JOB_NAMES.CREATE_EVENT,
    job,
    options
  );

}

}