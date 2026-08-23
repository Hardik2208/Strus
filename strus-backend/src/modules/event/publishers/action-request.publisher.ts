import type {
  JobsOptions,
} from "bullmq";

import {
  eventQueue,
} from "../../../core/queues/queues/event.queue.js";

import {
  JOB_NAMES,
} from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,

  ActionRequestCreatedJobData,

  ActionRequestRespondedJobData,

  ActionRequestExpiredJobData,

} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class ActionRequestPublisher {

  // ======================================================
  // Action Request Created
  // ======================================================

  static async publishActionRequestCreated(
    payload: ActionRequestCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {

      type:
        NotificationJobType.ACTION_REQUEST_CREATED,

      payload,

    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  // ======================================================
  // Action Request Responded
  // ======================================================

  static async publishActionRequestResponded(
    payload: ActionRequestRespondedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {

      type:
        NotificationJobType.ACTION_REQUEST_RESPONDED,

      payload,

    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  // ======================================================
  // Action Request Expired
  // ======================================================

  static async publishActionRequestExpired(
    payload: ActionRequestExpiredJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {

      type:
        NotificationJobType.ACTION_REQUEST_EXPIRED,

      payload,

    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

}