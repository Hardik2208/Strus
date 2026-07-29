import type { JobsOptions } from "bullmq";

import { eventQueue } from "../../../core/queues/queues/event.queue.js";
import { JOB_NAMES } from "../../../core/queues/queue.constants.js";

import type {
  NotificationJob,
  ExecutionPlanCreatedPayload,
  ExecutionPlanUpdatedPayload,
  ProjectAssetSharedPayload,
  MilestoneStartedPayload,
  SubmissionCreatedPayload,
  RevisionRequestedPayload,
  ExtensionGrantedPayload,
  MilestoneCompletedPayload,
} from "../types/notification.types.js";

import {
  NotificationJobType,
} from "../types/notification.types.js";

export class ExecutionPublisher {

  /**
   * Publish Execution Plan Created notification.
   */
  static async publishExecutionPlanCreated(
    payload: ExecutionPlanCreatedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.EXECUTION_PLAN_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Execution Plan Updated notification.
   */
  static async publishExecutionPlanUpdated(
    payload: ExecutionPlanUpdatedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.EXECUTION_PLAN_UPDATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Project Asset Shared notification.
   */
  static async publishProjectAssetShared(
    payload: ProjectAssetSharedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.PROJECT_ASSET_SHARED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Milestone Started notification.
   */
  static async publishMilestoneStarted(
    payload: MilestoneStartedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.MILESTONE_STARTED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Submission Created notification.
   */
  static async publishSubmissionCreated(
    payload: SubmissionCreatedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.SUBMISSION_CREATED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Revision Requested notification.
   */
  static async publishRevisionRequested(
    payload: RevisionRequestedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.REVISION_REQUESTED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Extension Granted notification.
   */
  static async publishExtensionGranted(
    payload: ExtensionGrantedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.EXTENSION_GRANTED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

  /**
   * Publish Milestone Completed notification.
   */
  static async publishMilestoneCompleted(
    payload: MilestoneCompletedPayload,
    options?: JobsOptions
  ): Promise<void> {

    const job: NotificationJob = {
      type: NotificationJobType.MILESTONE_COMPLETED,
      payload,
    };

    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      job,
      options
    );

  }

}