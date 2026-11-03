import { logger } from "../../../core/logger/index.js";
import { prisma } from "../../../core/database/prisma.js";

import { SubmissionAutoApprovalJob } from "./submission-auto-approval.job.js";

import { NegotiationService } from "../../negotiation/services/negotiation.service.js";
import { NegotiationRepository } from "../../negotiation/repositories/negotiation.repository.js";

import { ActionRequestService } from "../../action-request/services/action-request.service.js";
import { ActionRequestRepository } from "../../action-request/repositories/action-request.repository.js";

export class EventScheduler {

  private static interval:
    NodeJS.Timeout | null = null;

  private static running = false;

  // ==================================================
  // Start
  // ==================================================

  static start(): void {

    if (this.interval) {
      return;
    }

    logger.info(
      "Starting event scheduler."
    );

    // --------------------------------------------------
    // Run once on startup
    // --------------------------------------------------

    void this.runAll();

    // --------------------------------------------------
    // Run every 1 hour
    // --------------------------------------------------

    this.interval = setInterval(
      () => {
        void this.runAll();
      },
      60 * 60 * 1000
    );

  }

  // ==================================================
  // Stop
  // ==================================================

  static stop(): void {

    if (!this.interval) {
      return;
    }

    clearInterval(
      this.interval
    );

    this.interval = null;

    logger.info(
      "Event scheduler stopped."
    );

  }

  // ==================================================
  // Run All Scheduled Jobs
  // ==================================================

  private static async runAll(): Promise<void> {

    // --------------------------------------------------
    // Prevent overlapping scheduler executions
    // --------------------------------------------------

    if (this.running) {

      logger.warn(
        "Event scheduler cycle already running. Skipping cycle."
      );

      return;

    }

    this.running = true;

    try {

      await Promise.all([

        this.runSubmissionAutoApproval(),

        this.runNegotiationExpiry(),

        this.runActionRequestExpiry(),

      ]);

    } finally {

      this.running = false;

    }

  }

  // ==================================================
  // Submission Auto Approval
  // ==================================================

  private static async runSubmissionAutoApproval(): Promise<void> {

    try {

      await SubmissionAutoApprovalJob.execute();

    } catch (error) {

      logger.error(
        {
          error,
        },
        "Submission auto-approval scheduler job failed."
      );

    }

  }

  // ==================================================
  // Negotiation Expiry
  // ==================================================

  private static async runNegotiationExpiry(): Promise<void> {

    try {

      const negotiations =
        await NegotiationRepository.findExpiredNegotiations();

      for (const negotiation of negotiations) {

        try {

          await prisma.$transaction(
            async (tx) => {

              await NegotiationService.expireNegotiation(
                tx,
                negotiation.id
              );

            }
          );

        } catch (error) {

          logger.error(
            {
              error,
              negotiationId:
                negotiation.id,
            },
            "Failed to expire negotiation."
          );

        }

      }

    } catch (error) {

      logger.error(
        {
          error,
        },
        "Negotiation expiry scheduler job failed."
      );

    }

  }

  // ==================================================
  // ActionRequest Expiry
  // ==================================================

  private static async runActionRequestExpiry(): Promise<void> {

    try {

      const actionRequests =
        await ActionRequestRepository.findExpired();

      for (const actionRequest of actionRequests) {

        try {

          await ActionRequestService.expire(
            actionRequest.id
          );

        } catch (error) {

          logger.error(
            {
              error,
              actionRequestId:
                actionRequest.id,
            },
            "Failed to expire ActionRequest."
          );

        }

      }

    } catch (error) {

      logger.error(
        {
          error,
        },
        "ActionRequest expiry scheduler job failed."
      );

    }

  }

}