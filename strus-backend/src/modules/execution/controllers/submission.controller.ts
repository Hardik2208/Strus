import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { SubmissionMapper } from "../mappers/submission.mapper.js";
import type { CreateMilestoneSubmissionDto } from "../dtos/create-milestone-submission.dto.js";
import { SubmissionService } from "../services/submission.service.js";
import { SubmissionCache } from "../cache/submission.cache.js";

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
      const submission =
        await SubmissionService.create(
          req.params.milestoneId,
          req.user.id,
          req.body,
          req.files as Express.Multer.File[]
        );
      await SubmissionCache.invalidate(
  submission.id,
  submission.milestoneId
);

await SubmissionCache.invalidateRelatedDashboards(
  submission.id
);

      res.status(201).json({
        success: true,

        message:
          "Submission submitted successfully.",

        data: submission,
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