import type { Prisma } from "../../../generated/prisma/client.js";

import { ExecutionAuditAction } from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import type { CreateMilestoneDependencyDto } from "../dtos/create-milestone-dependency.dto.js";

import { ExecutionPermissionService } from "./execution-permission.service.js";

import { MilestoneDependencyRepository } from "../repositories/milestone-dependency.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";

import { MilestoneDependencyValidator } from "../validators/milestone-dependency.validator.js";

import { MilestoneCache } from "../cache/milestone.cache.js";

export class MilestoneDependencyService {
  // ==================================================
  // Create Dependency
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    projectId: string,
    userId: string,
    dto: CreateMilestoneDependencyDto
  ) {
    await ExecutionPermissionService.ensureExecutionPlanEditable(
      projectId,
      userId
    );

    MilestoneDependencyValidator.validateSelfDependency(
      dto.milestoneId,
      dto.dependsOnMilestoneId
    );

    const milestone =
      await ExecutionRepository.findMilestoneById(
        tx,
        dto.milestoneId
      );

    const dependsOn =
      await ExecutionRepository.findMilestoneById(
        tx,
        dto.dependsOnMilestoneId
      );

    if (!milestone || !dependsOn) {
      throw new AppError(
        "Milestone not found.",
        404,
        ErrorCode.MILESTONE_NOT_FOUND
      );
    }

    if (
      milestone.projectId !== projectId ||
      dependsOn.projectId !== projectId
    ) {
      throw new AppError(
        "Milestones must belong to the same project.",
        400,
        ErrorCode.INVALID_MILESTONE_DEPENDENCY
      );
    }

    const existing =
  await MilestoneDependencyRepository.findExisting(
    dto.milestoneId,
    dto.dependsOnMilestoneId
  );

    if (existing) {
      throw new AppError(
        "Dependency already exists.",
        409,
        ErrorCode.DUPLICATE_MILESTONE_DEPENDENCY
      );
    }

    // TODO
    // Circular dependency validation
    // DFS will be added here.

    const dependency =
      await MilestoneDependencyRepository.create(
        tx,
        {
          milestone: {
            connect: {
              id: dto.milestoneId,
            },
          },

          dependsOn: {
            connect: {
              id: dto.dependsOnMilestoneId,
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
        ExecutionAuditAction.DEPENDENCY_CREATED,

      metadata: {
        dependsOnMilestoneId:
          dto.dependsOnMilestoneId,
      },
    });

    await MilestoneCache.invalidateExecutionPlan(
      projectId
    );

    return dependency;
  }

  // ==================================================
  // Delete Dependency
  // ==================================================

  static async delete(
    tx: Prisma.TransactionClient,
    projectId: string,
    dependencyId: string,
    userId: string
  ): Promise<void> {
    await ExecutionPermissionService.ensureExecutionPlanEditable(
      projectId,
      userId
    );

    await MilestoneDependencyRepository.delete(
      tx,
      dependencyId
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

      action:
        ExecutionAuditAction.DEPENDENCY_REMOVED,
    });

    await MilestoneCache.invalidateExecutionPlan(
      projectId
    );
  }
}