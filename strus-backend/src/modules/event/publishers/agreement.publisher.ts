import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,
  AgreementCreatedJobData,
  AgreementUpdatedJobData,
  AgreementProfessionalInvitedJobData,
  AgreementInvitationAcceptedJobData,
  AgreementInvitationDeclinedJobData,
  AgreementInvitationWithdrawnJobData,
  AgreementProfessionalRemovedJobData,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class AgreementPublisher {

  /**
   * Publish Agreement Created notification.
   */
  static async publishAgreementCreated(
    payload: AgreementCreatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Agreement Updated notification.
   */
  static async publishAgreementUpdated(
    payload: AgreementUpdatedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_UPDATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Professional Invited notification.
   */
  static async publishProfessionalInvited(
    payload: AgreementProfessionalInvitedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_PROFESSIONAL_INVITED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Invitation Accepted notification.
   */
  static async publishInvitationAccepted(
    payload: AgreementInvitationAcceptedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_INVITATION_ACCEPTED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Invitation Declined notification.
   */
  static async publishInvitationDeclined(
    payload: AgreementInvitationDeclinedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_INVITATION_DECLINED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Invitation Withdrawn notification.
   */
  static async publishInvitationWithdrawn(
    payload: AgreementInvitationWithdrawnJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_INVITATION_WITHDRAWN,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Professional Removed notification.
   */
  static async publishProfessionalRemoved(
    payload: AgreementProfessionalRemovedJobData,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.AGREEMENT_PROFESSIONAL_REMOVED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

}