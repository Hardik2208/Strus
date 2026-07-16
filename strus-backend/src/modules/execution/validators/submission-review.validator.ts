import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import type {
  ApproveSubmissionDto,
  RequestRevisionDto,
} from "../dtos/review-submission.dto.js";

export class SubmissionReviewValidator {
  private static readonly MAX_COMMENT_LENGTH =
    5000;

  private static readonly MAX_REVISION_CONTENT_LENGTH =
    10000;

  // ==================================================
  // Approve
  // ==================================================

  static validateApproval(
    dto: ApproveSubmissionDto
  ): void {
    if (
      !dto.content
    ) {
      return;
    }

    if (
      dto.content.trim().length >
      this.MAX_COMMENT_LENGTH
    ) {
      throw new AppError(
        `Approval comment cannot exceed ${this.MAX_COMMENT_LENGTH} characters.`,
        400,
        ErrorCode.INVALID_SUBMISSION_REVIEW
      );
    }
  }

  // ==================================================
  // Request Revision
  // ==================================================

  static validateRevision(
    dto: RequestRevisionDto
  ): void {
    const content =
      dto.content?.trim();

    if (!content) {
      throw new AppError(
        "Revision requirements are required.",
        400,
        ErrorCode.INVALID_REVISION_REQUEST
      );
    }

    if (
      content.length >
      this.MAX_REVISION_CONTENT_LENGTH
    ) {
      throw new AppError(
        `Revision requirements cannot exceed ${this.MAX_REVISION_CONTENT_LENGTH} characters.`,
        400,
        ErrorCode.INVALID_REVISION_REQUEST
      );
    }
  }

  // ==================================================
  // Can Review
  // ==================================================

  static ensureReviewable(
    reviewedAt: Date | null
  ): void {
    if (reviewedAt) {
      throw new AppError(
        "This submission has already been reviewed.",
        409,
        ErrorCode.SUBMISSION_ALREADY_REVIEWED
      );
    }
  }

  // ==================================================
  // Revision Limit
  // ==================================================

  static ensureRevisionLimit(
    revisionCount: number,
    revisionLimit: number
  ): void {
    if (
      revisionCount >=
      revisionLimit
    ) {
      throw new AppError(
        "Revision limit has been reached. No further revisions can be requested. Please approve the submission or initiate a dispute.",
        409,
        ErrorCode.REVISION_LIMIT_REACHED
      );
    }
  }
}