import { prisma } from "../../../core/database/prisma.js";

import {
  ExecutionAuditAction,
  MilestoneStatus,
  SubmissionStatus,
} from "../../../generated/prisma/enums.js";
import { ProjectRepository } from "../../project/repositories/project.repository.js";

import {
  ProjectStatus,
} from "../../../generated/prisma/enums.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { SubmissionReviewSocket } from "../../../core/socket/submission-review.socket.js";
import type {
  ApproveSubmissionDto,
  RequestRevisionDto,
} from "../dtos/review-submission.dto.js";

import { SubmissionRepository } from "../repositories/submission.repository.js";
import { RevisionRequestRepository } from "../repositories/revision-request.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";

import { SubmissionReviewValidator } from "../validators/submission-review.validator.js";

import { ExecutionPermissionService } from "./execution-permission.service.js";

import { SubmissionCache } from "../cache/submission.cache.js";
import { SubmissionReviewCache } from "../cache/submission-review.cache.js";
import { MilestoneCache } from "../cache/milestone.cache.js";

export class SubmissionReviewService {
      // ==================================================
  // Get Reviewable Submission
  // ==================================================

  private static async getReviewableSubmission(
  submissionId: string,
  userId: string
) {
  const submission =
    await SubmissionRepository.findPendingReview(
      submissionId
    );

  if (!submission) {
    throw new AppError(
      "Submission not found.",
      404,
      ErrorCode.SUBMISSION_NOT_FOUND
    );
  }

  await ExecutionPermissionService.ensureExecutionAccess(
    submission.milestone.projectId,
    userId
  );

  SubmissionReviewValidator.ensureReviewable(
    submission.reviewedAt
  );

  if (
  submission.status !==
  SubmissionStatus.SUBMITTED
) {
  throw new AppError(
    "Submission cannot be reviewed.",
    400,
    ErrorCode.INVALID_SUBMISSION_REVIEW
  );
}

  if (
    submission.milestone.status !==
    MilestoneStatus.SUBMITTED
  ) {
    throw new AppError(
      "Milestone is not awaiting review.",
      400,
      ErrorCode.INVALID_SUBMISSION_REVIEW
    );
  }

  return submission;
}

    // ==================================================
  // Approve Submission
  // ==================================================

  static async approve(
  submissionId: string,
  userId: string,
  dto: ApproveSubmissionDto
) {
  const submission =
    await this.getReviewableSubmission(
      submissionId,
      userId
    );

  SubmissionReviewValidator.validateApproval(
    dto
  );

  const reviewedSubmission =
    await prisma.$transaction(
      async (tx) => {
        const reviewedSubmission =
          await SubmissionRepository.updateStatus(
            tx,
            submissionId,
            {
              status:
                SubmissionStatus.APPROVED,

              reviewedAt:
                new Date(),

              reviewedBy: {
                connect: {
                  id: userId,
                },
              },
            }
          );

        await ExecutionRepository.updateMilestone(
          tx,
          submission.milestone.id,
          {
            status:
              MilestoneStatus.COMPLETED,

            completedAt:
              new Date(),

            updatedBy: {
              connect: {
                id: userId,
              },
            },
          }
        );

        const hasIncompleteMilestones =
  await ExecutionRepository.hasIncompleteMilestones(
    tx,
    submission.milestone.projectId
  );

if (!hasIncompleteMilestones) {
  await ProjectRepository.updateStatus(
    tx,
    submission.milestone.projectId,
    ProjectStatus.COMPLETED
  );
}

        const nextMilestone =
          await ExecutionRepository.findNextMilestone(
            tx,
            submission.milestone.projectId,
            submission.milestone
              .agreementParticipantId,
            submission.milestone.order
          );

        if (
          nextMilestone &&
          nextMilestone.status ===
            MilestoneStatus.NOT_STARTED
        ) {
          await ExecutionRepository.updateMilestone(
            tx,
            nextMilestone.id,
            {
              status:
                MilestoneStatus.IN_PROGRESS,

              startedAt:
                new Date(),

              updatedBy: {
                connect: {
                  id: userId,
                },
              },
            }
          );
        }

        await ExecutionAuditRepository.create(
          tx,
          {
            project: {
              connect: {
                id:
                  submission.milestone.projectId,
              },
            },

            actor: {
              connect: {
                id: userId,
              },
            },

            milestone: {
              connect: {
                id:
                  submission.milestone.id,
              },
            },

            action:
              ExecutionAuditAction.MILESTONE_APPROVED,

            metadata: {
              submissionId,
            },
          }
        );

        const hydratedSubmission =
  await SubmissionRepository.findById(
    reviewedSubmission.id
  );

if (!hydratedSubmission) {
  throw new AppError(
    "Submission not found.",
    404,
    ErrorCode.SUBMISSION_NOT_FOUND
  );
}

return hydratedSubmission;
      }
    );

  await Promise.all([
  SubmissionCache.invalidate(
    submission.id,
    submission.milestone.id
  ),

  SubmissionCache.invalidateRelatedDashboards(
    submission.id
  ),

  SubmissionReviewCache.invalidate(
    submission.id,
    submission.milestone.project.workspaceId
  ),

  MilestoneCache.invalidateMilestone(
    submission.milestone.id
  ),

  MilestoneCache.invalidateExecutionPlan(
    submission.milestone.projectId
  ),

  MilestoneCache.invalidateRelatedDashboards(
    submission.milestone.id
  ),
]);

  SubmissionReviewSocket.emitSubmissionApproved(
  submission.milestone.project.workspaceId,
  submission.id,
  submission.milestone.id
);

SubmissionReviewSocket.emitPendingReviewUpdated(
  submission.milestone.project.workspaceId
);

  return reviewedSubmission;
}

    // ==================================================
  // Request Revision
  // ==================================================

  static async requestRevision(
  submissionId: string,
  userId: string,
  dto: RequestRevisionDto
) {
  const submission =
    await this.getReviewableSubmission(
      submissionId,
      userId
    );

  SubmissionReviewValidator.validateRevision(
    dto
  );

  SubmissionReviewValidator.ensureRevisionLimit(
    submission.milestone.revisionCount,
    submission.milestone.revisionLimit
  );

  const revision = await prisma.$transaction(
    async (tx) => {
      const latestRevision =
        await RevisionRequestRepository.findLatest(
          submission.milestone.id
        );

      const revisionNumber =
        (latestRevision?.revisionNumber ?? 0) +
        1;

      await RevisionRequestRepository.create(
        tx,
        {
          submission: {
            connect: {
              id: submission.id,
            },
          },

          milestone: {
            connect: {
              id:
                submission.milestone.id,
            },
          },

          requestedBy: {
            connect: {
              id: userId,
            },
          },

          content:
            dto.content.trim(),

          revisionNumber,
        }
      );

      await SubmissionRepository.updateStatus(
        tx,
        submission.id,
        {
          status:
            SubmissionStatus.REVISION_REQUESTED,

          reviewedAt:
            new Date(),

          reviewedBy: {
            connect: {
              id: userId,
            },
          },
        }
      );

      await ExecutionRepository.updateMilestone(
        tx,
        submission.milestone.id,
        {
          revisionCount: {
            increment: 1,
          },

          status:
            MilestoneStatus.IN_PROGRESS,

          updatedBy: {
            connect: {
              id: userId,
            },
          },
        }
      );

      await ExecutionAuditRepository.create(
        tx,
        {
          project: {
            connect: {
              id:
                submission.milestone.projectId,
            },
          },

          actor: {
            connect: {
              id: userId,
            },
          },

          milestone: {
            connect: {
              id:
                submission.milestone.id,
            },
          },

          action:
            ExecutionAuditAction.REVISION_REQUESTED,

          metadata: {
            submissionId:
              submission.id,

            revisionNumber,
          },
        }
      );

      const createdRevision =
  await RevisionRequestRepository.findBySubmission(
    tx,
    submission.id
  );

      if (!createdRevision) {
        throw new AppError(
          "Revision request could not be retrieved.",
          500,
          ErrorCode.REVISION_ALREADY_REQUESTED
        );
      }

      return createdRevision;
    }
  );

  await Promise.all([
  SubmissionCache.invalidate(
    submission.id,
    submission.milestone.id
  ),

  SubmissionCache.invalidateRelatedDashboards(
    submission.id
  ),

  SubmissionReviewCache.invalidate(
    submission.id,
    submission.milestone.project.workspaceId
  ),

  MilestoneCache.invalidateMilestone(
    submission.milestone.id
  ),

  MilestoneCache.invalidateExecutionPlan(
    submission.milestone.projectId
  ),

  MilestoneCache.invalidateRelatedDashboards(
    submission.milestone.id
  ),
]);

  SubmissionReviewSocket.emitRevisionRequested(
    submission.milestone.project.workspaceId,
    submission.id,
    submission.milestone.id
  );

  SubmissionReviewSocket.emitPendingReviewUpdated(
    submission.milestone.project.workspaceId
  );

  return revision;
}

    // ==================================================
  // Pending Reviews
  // ==================================================

  static async getPendingReviews(
  workspaceId: string,
  userId: string
) {
  const cached =
    await SubmissionReviewCache.getPendingReviews<
      Awaited<
        ReturnType<
          typeof SubmissionRepository.findWorkspacePendingReviews
        >
      >
    >(workspaceId);

  if (cached) {
    return cached;
  }

  const reviews =
    await SubmissionRepository.findWorkspacePendingReviews(
      workspaceId,
      userId
    );

  await SubmissionReviewCache.setPendingReviews(
    workspaceId,
    reviews
  );

  return reviews;
}

// ==================================================
// Auto Approve Submission
// ==================================================

static async autoApprove(
  submissionId: string
) {
  const submission =
    await SubmissionRepository.findPendingReview(
      submissionId
    );

  if (!submission) {
    return;
  }

  if (
    submission.reviewedAt ||
    submission.status !==
      SubmissionStatus.SUBMITTED
  ) {
    return;
  }

  const reviewedSubmission =
    await prisma.$transaction(
      async (tx) => {
        const reviewedSubmission =
          await SubmissionRepository.updateStatus(
            tx,
            submission.id,
            {
              status:
                SubmissionStatus.APPROVED,

              reviewedAt:
                new Date(),
            }
          );

        await ExecutionRepository.updateMilestone(
          tx,
          submission.milestone.id,
          {
            status:
              MilestoneStatus.COMPLETED,

            completedAt:
              new Date(),
          }
        );

        const hasIncompleteMilestones =
  await ExecutionRepository.hasIncompleteMilestones(
    tx,
    submission.milestone.projectId
  );

if (!hasIncompleteMilestones) {
  await ProjectRepository.updateStatus(
    tx,
    submission.milestone.projectId,
    ProjectStatus.COMPLETED
  );
}

        const nextMilestone =
          await ExecutionRepository.findNextMilestone(
            tx,
            submission.milestone.projectId,
            submission.milestone
              .agreementParticipantId,
            submission.milestone.order
          );

        if (
          nextMilestone &&
          nextMilestone.status ===
            MilestoneStatus.NOT_STARTED
        ) {
          await ExecutionRepository.updateMilestone(
            tx,
            nextMilestone.id,
            {
              status:
                MilestoneStatus.IN_PROGRESS,

              startedAt:
                new Date(),
            }
          );
        }

        await ExecutionAuditRepository.create(
          tx,
          {
            project: {
              connect: {
                id:
                  submission.milestone.projectId,
              },
            },

            milestone: {
              connect: {
                id:
                  submission.milestone.id,
              },
            },

            action:
              ExecutionAuditAction.MILESTONE_APPROVED,

            metadata: {
              submissionId:
                submission.id,

              autoApproved: true,
            },
          }
        );

        const hydratedSubmission =
          await SubmissionRepository.findById(
            reviewedSubmission.id
          );

        if (!hydratedSubmission) {
          throw new AppError(
            "Submission not found.",
            404,
            ErrorCode.SUBMISSION_NOT_FOUND
          );
        }

        return hydratedSubmission;
      }
    );

  await Promise.all([
  SubmissionCache.invalidate(
    submission.id,
    submission.milestone.id
  ),

  SubmissionCache.invalidateRelatedDashboards(
    submission.id
  ),

  SubmissionReviewCache.invalidate(
    submission.id,
    submission.milestone.project.workspaceId
  ),

  MilestoneCache.invalidateMilestone(
    submission.milestone.id
  ),

  MilestoneCache.invalidateExecutionPlan(
    submission.milestone.projectId
  ),

  MilestoneCache.invalidateRelatedDashboards(
    submission.milestone.id
  ),
]);

  SubmissionReviewSocket.emitSubmissionApproved(
    submission.milestone.project.workspaceId,
    submission.id,
    submission.milestone.id
  );

  SubmissionReviewSocket.emitPendingReviewUpdated(
    submission.milestone.project.workspaceId
  );

  return reviewedSubmission;
}
}