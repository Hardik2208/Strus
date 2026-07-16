import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { RevisionRequestMapper } from "../mappers/revision-request.mapper.js";
import type {
  ApproveSubmissionDto,
  RequestRevisionDto,
} from "../dtos/review-submission.dto.js";

import { SubmissionReviewService } from "../services/submission-review.service.js";
import { SubmissionMapper } from "../mappers/submission.mapper.js";

export class SubmissionReviewController {
  // ==================================================
  // Approve Submission
  // ==================================================

  static async approve(
    req: AuthenticatedRequest<
      { submissionId: string },
      unknown,
      ApproveSubmissionDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { submissionId } =
        req.params;

      const userId =
        req.user.id;

      const dto =
        req.body as ApproveSubmissionDto;

      const submission =
        await SubmissionReviewService.approve(
          submissionId,
          userId,
          dto
        );

      res.status(200).json({
        success: true,

        message:
          "Submission approved successfully.",

        data:
          SubmissionMapper.toResponse(
            submission
          ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Request Revision
  // ==================================================

  // ==================================================
// Request Revision
// ==================================================

static async requestRevision(
  req: AuthenticatedRequest<
    { submissionId: string },
    unknown,
    RequestRevisionDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { submissionId } =
      req.params;

    const userId =
      req.user.id;

    const dto =
      req.body as RequestRevisionDto;

    const revision =
      await SubmissionReviewService.requestRevision(
        submissionId,
        userId,
        dto
      );

    res.status(200).json({
      success: true,

      message:
        "Revision requested successfully.",

      data:
        RevisionRequestMapper.toResponse(
          revision
        ),
    });
  } catch (error) {
    next(error);
  }
}

  // ==================================================
  // Pending Reviews
  // ==================================================

  static async getPendingReviews(
    req: AuthenticatedRequest<{
      workspaceId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { workspaceId } =
        req.params;

      const userId =
        req.user.id;

      const reviews =
        await SubmissionReviewService.getPendingReviews(
          workspaceId,
          userId
        );

      res.status(200).json({
        success: true,

        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }
}