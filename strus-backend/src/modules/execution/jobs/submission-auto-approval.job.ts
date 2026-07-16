import { logger } from "../../../core/logger/index.js";

import { SubmissionAutoApprovalRepository } from "../repositories/submission-auto-approval.repository.js";
import { SubmissionReviewService } from "../services/submission-review.service.js";

export class SubmissionAutoApprovalJob {
  // ==================================================
  // Execute
  // ==================================================

  static async execute(): Promise<void> {
    const submissions =
      await SubmissionAutoApprovalRepository.findExpiredSubmissions();

    if (submissions.length === 0) {
      return;
    }

    logger.info(
      {
        count: submissions.length,
      },
      "Running automatic submission approval."
    );

    for (const submission of submissions) {
      try {
        await SubmissionReviewService.autoApprove(
          submission.id
        );

        logger.info(
          {
            submissionId:
              submission.id,
          },
          "Submission auto approved."
        );
      } catch (error) {
        logger.error(
          {
            error,
            submissionId:
              submission.id,
          },
          "Failed to auto approve submission."
        );
      }
    }

    logger.info(
      {
        processed:
          submissions.length,
      },
      "Automatic submission approval completed."
    );
  }
}