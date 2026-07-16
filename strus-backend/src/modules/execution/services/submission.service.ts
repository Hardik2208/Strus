import { prisma } from "../../../core/database/prisma.js";

import type {
  MilestoneSubmission,
} from "../../../generated/prisma/client.js";

import {
  SubmissionTiming,
} from "../../../generated/prisma/enums.js";

import {
  ExecutionAuditAction,
  SubmissionAttachmentType,
  SubmissionStatus,
} from "../../../generated/prisma/enums.js";

import {
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { CloudinaryService } from "../../../core/storage/cloudinary.service.js";

import type { CreateMilestoneSubmissionDto } from "../dtos/create-milestone-submission.dto.js";

import { SubmissionRepository } from "../repositories/submission.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";
import { MilestoneDeadlineUtil } from "../utils/milestone-deadline.util.js";
import { ExecutionPermissionService } from "./execution-permission.service.js";

import { SubmissionValidator } from "../validators/submission.validator.js";

import { SubmissionCache } from "../cache/submission.cache.js";
import { MilestoneCache } from "../cache/milestone.cache.js";

export class SubmissionService {
  // ==================================================
  // Upload Attachments
  // ==================================================

  private static async uploadAttachments(
  files?: Express.Multer.File[]
) {
  const attachments = files ?? [];

  if (attachments.length === 0) {
    return [];
  }

  const uploaded: Array<{
    upload: Awaited<
      ReturnType<typeof CloudinaryService.upload>
    >;
    file: Express.Multer.File;
  }> = [];

  for (const file of attachments) {
    const upload =
      await CloudinaryService.upload(file.buffer, {
        folder: "strus/submissions",
        resourceType: this.determineResourceType(
          file.mimetype
        ),
      });

    uploaded.push({
      upload,
      file,
    });
  }

  return uploaded;
}

  // ==================================================
  // Cleanup Uploads
  // ==================================================

  private static async cleanupUploads(
  uploads: Array<{
    upload: Awaited<
      ReturnType<typeof CloudinaryService.upload>
    >;
  }>
): Promise<void> {
  await Promise.all(
    uploads.map(async ({ upload }) => {
      if (!upload.publicId) {
        return;
      }

      await CloudinaryService.delete(
        upload.publicId,
        this.determineResourceTypeFromExtension(
          upload.format
        )
      );
    })
  );
}

  // ==================================================
  // Resource Type
  // ==================================================

  private static determineResourceType(
    mimeType: string
  ): "image" | "video" | "raw" {
    if (
      mimeType.startsWith(
        "image/"
      )
    ) {
      return "image";
    }

    if (
      mimeType.startsWith(
        "video/"
      )
    ) {
      return "video";
    }

    return "raw";
  }

  // ==================================================
  // Attachment Type
  // ==================================================

  private static determineAttachmentType(
    mimeType: string
  ): SubmissionAttachmentType {
    if (
      mimeType.startsWith(
        "image/"
      )
    ) {
      return SubmissionAttachmentType.IMAGE;
    }

    if (
      mimeType.startsWith(
        "video/"
      )
    ) {
      return SubmissionAttachmentType.VIDEO;
    }

    if (
      mimeType.includes(
        "zip"
      ) ||
      mimeType.includes(
        "rar"
      ) ||
      mimeType.includes(
        "7z"
      )
    ) {
      return SubmissionAttachmentType.ARCHIVE;
    }

    if (
      mimeType.includes(
        "pdf"
      ) ||
      mimeType.includes(
        "word"
      ) ||
      mimeType.includes(
        "excel"
      ) ||
      mimeType.includes(
        "presentation"
      ) ||
      mimeType.startsWith(
        "text/"
      )
    ) {
      return SubmissionAttachmentType.DOCUMENT;
    }

    return SubmissionAttachmentType.OTHER;
  }

  // ==================================================
  // Cloudinary Delete Resource Type
  // ==================================================

  private static determineResourceTypeFromExtension(
  extension?: string
): "image" | "video" | "raw" {
  if (!extension) {
    return "raw";
  }

  const ext = extension.toLowerCase();

  if (
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "svg",
    ].includes(ext)
  ) {
    return "image";
  }

  if (
    [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
    ].includes(ext)
  ) {
    return "video";
  }

  return "raw";
}

    // ==================================================
  // Create Submission
  // ==================================================

  static async create(
  milestoneId: string,
  userId: string,
  dto: CreateMilestoneSubmissionDto,
  files: Express.Multer.File[]
): Promise<MilestoneSubmission> {
  const milestone =
    await SubmissionRepository.findMilestone(
      milestoneId
    );

  if (!milestone) {
    throw new AppError(
      "Milestone not found.",
      404,
      ErrorCode.MILESTONE_NOT_FOUND
    );
  }

  await ExecutionPermissionService.ensureExecutionAccess(
    milestone.projectId,
    userId
  );

  SubmissionValidator.validate(
    dto.content,
    files
  );

  if (
    milestone.agreementParticipant.userId !==
    userId
  ) {
    throw new AppError(
      "Only the assigned professional can submit work.",
      403,
      ErrorCode.FORBIDDEN
    );
  }

  if (
    milestone.status !==
    MilestoneStatus.IN_PROGRESS
  ) {
    throw new AppError(
      "Milestone is not accepting submissions.",
      400,
      ErrorCode.INVALID_SUBMISSION
    );
  }

  if (!milestone.startedAt) {
    throw new AppError(
      "Milestone has not started.",
      400,
      ErrorCode.INVALID_SUBMISSION
    );
  }

  const latestSubmission =
    await SubmissionRepository.findLatestSubmission(
      milestoneId
    );

  if (
    latestSubmission &&
    (
      latestSubmission.status ===
        SubmissionStatus.SUBMITTED ||
      latestSubmission.status ===
        SubmissionStatus.UNDER_REVIEW
    )
  ) {
    throw new AppError(
      "The previous submission is still under review.",
      400,
      ErrorCode.SUBMISSION_UNDER_REVIEW
    );
  }

  const uploadedAttachments =
    await this.uploadAttachments(
      files
    );
  const submittedAt = new Date();

const deadline =
  MilestoneDeadlineUtil.calculateDeadline(
    milestone.startedAt,
    milestone.allocatedDays,
    milestone.extensionDays
  );

const timing =
  submittedAt <= deadline
    ? SubmissionTiming.ON_TIME
    : SubmissionTiming.LATE;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const submission =
          await SubmissionRepository.create(
            tx,
            {
              milestone: {
                connect: {
                  id: milestoneId,
                },
              },

              submittedBy: {
                connect: {
                  id: userId,
                },
              },

              submissionNumber:
                (
                  latestSubmission
                    ?.submissionNumber ??
                  0
                ) + 1,

              content:
                dto.content?.trim(),

              status:
                SubmissionStatus.SUBMITTED,

              timing,

              submittedAt,
            }
          );

        if (
          uploadedAttachments.length >
          0
        ) {
          await SubmissionRepository.createAttachments(
            tx,
            uploadedAttachments.map(
              ({
                upload,
                file,
              }) => ({
                submissionId:
                  submission.id,

                publicId:
                  upload.publicId,

                url:
                  upload.url,

                originalName:
                  file.originalname,

                mimeType:
                  file.mimetype,

                extension:
                  file.originalname
                    .split(".")
                    .pop()
                    ?.toLowerCase() ??
                  "",

                attachmentType:
                  this.determineAttachmentType(
                    file.mimetype
                  ),

                size: BigInt(
                  upload.bytes
                ),
              })
            )
          );
        }

        await ExecutionRepository.updateMilestone(
          tx,
          milestoneId,
          {
            status:
              MilestoneStatus.SUBMITTED,

            submittedAt,

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
                id: milestone.projectId,
              },
            },

            actor: {
              connect: {
                id: userId,
              },
            },

            milestone: {
              connect: {
                id: milestoneId,
              },
            },

            action:
              ExecutionAuditAction.MILESTONE_SUBMITTED,

            metadata: {
              submissionId:
                submission.id,

              submissionNumber:
                submission.submissionNumber,

              attachments:
                uploadedAttachments.length,

              timing,

              extensionDays:
                milestone.extensionDays,
            },
          }
        );

        await SubmissionCache.invalidate(
          submission.id,
          milestoneId
        );

        await MilestoneCache.invalidateMilestone(
          milestoneId
        );

        await MilestoneCache.invalidateExecutionPlan(
          milestone.projectId
        );

        return submission;
      }
    );
  } catch (error) {
    await this.cleanupUploads(
      uploadedAttachments
    );

    throw error;
  }
}

    // ==================================================
  // Get Submission
  // ==================================================

  static async getSubmission(
    submissionId: string,
    userId: string
  ) {
    const submission =
      await SubmissionRepository.findById(
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

    return submission;
  }

  // ==================================================
  // List Milestone Submissions
  // ==================================================

  static async listMilestoneSubmissions(
    milestoneId: string,
    userId: string
  ) {
    const milestone =
      await SubmissionRepository.findMilestone(
        milestoneId
      );

    if (!milestone) {
      throw new AppError(
        "Milestone not found.",
        404,
        ErrorCode.MILESTONE_NOT_FOUND
      );
    }

    await ExecutionPermissionService.ensureExecutionAccess(
      milestone.projectId,
      userId
    );

    return SubmissionRepository.findMilestoneSubmissions(
      milestoneId
    );
  }
}