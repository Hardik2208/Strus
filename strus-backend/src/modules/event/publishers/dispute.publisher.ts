import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,
  DisputeCreatedJobData,
  DisputeResolutionProposedJobData,
  DisputeResolvedJobData,
  DisputeClosedJobData,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class DisputePublisher {

  /**
   * Publish Dispute Created notification.
   */
  static async publishDisputeCreated(
    payload: DisputeCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.DISPUTE_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Resolution Proposed notification.
   */
  static async publishResolutionProposed(
    payload: DisputeResolutionProposedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.DISPUTE_RESOLUTION_PROPOSED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Dispute Resolved notification.
   */
  static async publishDisputeResolved(
    payload: DisputeResolvedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.DISPUTE_RESOLVED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Dispute Closed notification.
   */
  static async publishDisputeClosed(
    payload: DisputeClosedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.DISPUTE_CLOSED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

}