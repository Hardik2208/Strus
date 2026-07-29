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
import { ExecutionPublisher } from "../../event/publishers/execution.publisher.js";

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

    const result =
      await SubmissionReviewService.approve(
        submissionId,
        userId,
        dto
      );

    await ExecutionPublisher.publishMilestoneCompleted({

      createdById: userId,

      projectId:
        result.completedMilestone.projectId,

      milestoneId:
        result.completedMilestone.id,

      agreementParticipantId:
        result.completedMilestone
          .agreementParticipantId,

    });

    if (result.startedMilestone) {

      await ExecutionPublisher.publishMilestoneStarted({

        createdById: userId,

        projectId:
          result.startedMilestone.projectId,

        milestoneId:
          result.startedMilestone.id,

        agreementParticipantId:
          result.startedMilestone
            .agreementParticipantId,

      });

    }

    res.status(200).json({
      success: true,

      message:
        "Submission approved successfully.",

      data:
        SubmissionMapper.toResponse(
          result.submission
        ),
    });

  } catch (error) {
    next(error);
  }
}

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

    await ExecutionPublisher.publishRevisionRequested({

  createdById: userId,

  projectId: revision.milestone.projectId,

  milestoneId: revision.milestoneId,

  revisionRequestId: revision.id,

  agreementParticipantId:
  revision.milestone.agreementParticipantId,

});

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