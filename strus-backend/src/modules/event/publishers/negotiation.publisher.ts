import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,
  NegotiationCreatedJobData,
  NegotiationAcceptedJobData,
  NegotiationDeclinedJobData,
  NegotiationExpiredJobData,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class NegotiationPublisher {

  // ==================================================
  // Negotiation Created
  // ==================================================

  static async publishNegotiationCreated(
    payload: NegotiationCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type:
        NotificationJobType.NEGOTIATION_CREATED,

      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  // ==================================================
  // Negotiation Accepted
  // ==================================================

  static async publishNegotiationAccepted(
    payload: NegotiationAcceptedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type:
        NotificationJobType.NEGOTIATION_ACCEPTED,

      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  // ==================================================
  // Negotiation Declined
  // ==================================================

  static async publishNegotiationDeclined(
    payload: NegotiationDeclinedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type:
        NotificationJobType.NEGOTIATION_DECLINED,

      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  // ==================================================
  // Negotiation Expired
  // ==================================================

  static async publishNegotiationExpired(
    payload: NegotiationExpiredJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type:
        NotificationJobType.NEGOTIATION_EXPIRED,

      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

}