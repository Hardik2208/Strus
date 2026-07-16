import type { Prisma } from "../../../generated/prisma/client.js";

import { ExecutionAuditAction } from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import type { CreateMilestoneExtensionDto } from "../dtos/create-milestone-extension.dto.js";

import { ExecutionPermissionService } from "./execution-permission.service.js";

import { ExecutionRepository } from "../repositories/execution.repository.js";
import { MilestoneExtensionRepository } from "../repositories/milestone-extension.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";

import { MilestoneExtensionValidator } from "../validators/milestone-extension.validator.js";

import { MilestoneCache } from "../cache/milestone.cache.js";

export class MilestoneExtensionService {
  // ==================================================
  // Grant Extension
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    projectId: string,
    userId: string,
    dto: CreateMilestoneExtensionDto
  ) {
    await ExecutionPermissionService.ensureExecutionAccess(
      projectId,
      userId
    );

    MilestoneExtensionValidator.validateDays(
      dto.daysAdded
    );

    MilestoneExtensionValidator.validateReason(
      dto.reason
    );

    const milestone =
      await ExecutionRepository.findMilestoneById(
        tx,
        dto.milestoneId
      );

    if (!milestone) {
      throw new AppError(
        "Milestone not found.",
        404,
        ErrorCode.MILESTONE_NOT_FOUND
      );
    }

    if (milestone.projectId !== projectId) {
      throw new AppError(
        "Milestone does not belong to this project.",
        400,
        ErrorCode.INVALID_REQUEST
      );
    }

    const updatedMilestone =
  await ExecutionRepository.incrementExtensionDays(
    tx,
    dto.milestoneId,
    dto.daysAdded,
    userId
  );

    const extension =
      await MilestoneExtensionRepository.create(
        tx,
        {
          daysAdded: dto.daysAdded,

          reason: dto.reason.trim(),

          milestone: {
            connect: {
              id: dto.milestoneId,
            },
          },

          approvedBy: {
            connect: {
              id: userId,
            },
          },
        }
      );

    await ExecutionAuditRepository.create(tx, {
      project: {
        connect: {
          id: projectId,
        },
      },

      actor: {
        connect: {
          id: userId,
        },
      },

      milestone: {
        connect: {
          id: dto.milestoneId,
        },
      },

      action:
        ExecutionAuditAction.EXTENSION_GRANTED,

      metadata: {
        daysAdded: dto.daysAdded,

        totalExtensionDays:
          updatedMilestone.extensionDays,

        reason: dto.reason.trim(),
      },
    });

    await MilestoneCache.invalidateExecutionPlan(
      projectId
    );

    await MilestoneCache.invalidateMilestone(
      dto.milestoneId
    );

    return extension;
  }
}