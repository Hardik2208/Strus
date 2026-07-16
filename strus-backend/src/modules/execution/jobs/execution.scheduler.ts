import { logger } from "../../../core/logger/index.js";

import { SubmissionAutoApprovalJob } from "./submission-auto-approval.job.js";

export class ExecutionScheduler {
  private static interval:
    NodeJS.Timeout | null = null;

  // ==================================================
  // Start
  // ==================================================

  static start(): void {
    if (this.interval) {
      return;
    }

    logger.info(
      "Starting execution scheduler."
    );

    // Run once on startup
    void SubmissionAutoApprovalJob.execute();

    // Run every 10 minutes
    this.interval = setInterval(
      async () => {
        try {
          await SubmissionAutoApprovalJob.execute();
        } catch (error) {
          logger.error(
            {
              error,
            },
            "Execution scheduler failed."
          );
        }
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
      "Execution scheduler stopped."
    );
  }
}