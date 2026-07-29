import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { SubmissionMapper } from "../mappers/submission.mapper.js";
import type { CreateMilestoneSubmissionDto } from "../dtos/create-milestone-submission.dto.js";
import { SubmissionService } from "../services/submission.service.js";
import { SubmissionCache } from "../cache/submission.cache.js";
import { ExecutionPublisher } from "../../event/publishers/execution.publisher.js";

export class SubmissionController {
  // ==================================================
  // Submit
  // ==================================================

  static async create(
  req: AuthenticatedRequest<
    {
      milestoneId: string;
    },
    unknown,
    CreateMilestoneSubmissionDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result =
      await SubmissionService.create(
        req.params.milestoneId,
        req.user.id,
        req.body,
        req.files as Express.Multer.File[]
      );

    await ExecutionPublisher.publishSubmissionCreated({

      createdById: req.user.id,

      projectId:
        result.projectId,

      milestoneId:
        result.submission.milestoneId,

      submissionId:
        result.submission.id,

      agreementParticipantId:
        result.agreementParticipantId,

    });

    res.status(201).json({
      success: true,

      message:
        "Submission submitted successfully.",

      data:
        result.submission,
    });

  } catch (error) {
    next(error);
  }
}

  // ==================================================
  // Get
  // ==================================================

  static async get(
    req: AuthenticatedRequest<{
      submissionId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const submission =
        await SubmissionService.getSubmission(
          req.params.submissionId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        data: SubmissionMapper.toResponse(
  submission
),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Milestone Submissions
  // ==================================================

  static async list(
    req: AuthenticatedRequest<{
      milestoneId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const submissions =
        await SubmissionService.listMilestoneSubmissions(
          req.params.milestoneId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        data: SubmissionMapper.toResponseList(
  submissions
),
      });
    } catch (error) {
      next(error);
    }
  }
}