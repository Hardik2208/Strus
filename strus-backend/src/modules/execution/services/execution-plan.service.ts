import type {
  Milestone,
  Prisma,
} from "../../../generated/prisma/client.js";

import {
  ExecutionAuditAction,
  ProjectSetupStage,
} from "../../../generated/prisma/enums.js";

import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { AppError } from "../../../core/errors/AppError.js";
import { MilestoneCache } from "../cache/milestone.cache.js";
import type { CreateExecutionPlanDto } from "../dtos/create-execution-plan.dto.js";
import { MilestoneSpecificationService } from "./milestone-specification.service.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";
import { ProjectCache } from "../../project/cache/project.cache.js"
import { ExecutionPermissionService } from "./execution-permission.service.js";

import { ExecutionValidator } from "../validators/execution.validator.js";

export class MilestoneService {
  // ==================================================
  // Create Execution Plan
  // ==================================================

  static async createExecutionPlan(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: CreateExecutionPlanDto
): Promise<Milestone[]> {
  await ExecutionPermissionService.ensureExecutionPlanCreatable(
    projectId,
    userId
  );

  return this.createExecutionPlanInternal(
    tx,
    projectId,
    userId,
    dto
  );
}

// ==================================================
// Get Execution Plan
// ==================================================

static async getExecutionPlan(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string
): Promise<Milestone[]> {
  await ExecutionPermissionService.ensureExecutionAccess(
    projectId,
    userId
  );

  return ExecutionRepository.findProjectMilestones(
    tx,
    projectId
  );
}

// ==================================================
// Update Execution Plan
// ==================================================

static async updateExecutionPlan(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: CreateExecutionPlanDto
): Promise<Milestone[]> {
  await ExecutionPermissionService.ensureExecutionPlanEditable(
    projectId,
    userId
  );

  await ExecutionRepository.softDeleteProjectMilestones(
    tx,
    projectId
  );

  return this.createExecutionPlanInternal(
    tx,
    projectId,
    userId,
    dto
  );
}

// ==================================================
// Delete Execution Plan
// ==================================================

static async deletePlan(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string
): Promise<void> {
  await ExecutionPermissionService.ensureExecutionPlanEditable(
  projectId,
  userId
);

await ExecutionRepository.softDeleteProjectMilestones(
  tx,
  projectId
);

await ExecutionRepository.updateSetupStage(
  tx,
  projectId,
  ProjectSetupStage.PROFESSIONALS_ASSIGNED
);

await ProjectCache.invalidate(projectId);


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
    ExecutionAuditAction.MILESTONE_DELETED,
});
}

private static async createExecutionPlanInternal(
  tx: Prisma.TransactionClient,
  projectId: string,
  userId: string,
  dto: CreateExecutionPlanDto
): Promise<Milestone[]> {
  // ------------------------------------------
  // Agreement
  // ------------------------------------------

  const agreement =
    await ExecutionRepository.findAgreementByProjectId(
      tx,
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  // ------------------------------------------
  // Validation
  // ------------------------------------------

  let totalAllocation = 0;

  const participantIds = new Set<string>();

  const validParticipants = new Set(
    agreement.participants.map(
      (participant) => participant.id
    )
  );

  const milestonesToCreate: Prisma.MilestoneCreateManyInput[] = [];

  for (const professional of dto.professionals) {
    if (
      participantIds.has(
        professional.agreementParticipantId
      )
    ) {
      throw new AppError(
        "Duplicate professional found.",
        400,
        ErrorCode.INVALID_REQUEST
      );
    }

    participantIds.add(
      professional.agreementParticipantId
    );

    if (
      !validParticipants.has(
        professional.agreementParticipantId
      )
    ) {
      throw new AppError(
        "Invalid agreement participant.",
        400,
        ErrorCode.INVALID_REQUEST
      );
    }

    professional.milestones.forEach(
      (milestone, index) => {
        ExecutionValidator.validateAllocatedDays(
          milestone.allocatedDays
        );

        ExecutionValidator.validatePaymentAllocation(
          milestone.paymentAllocation
        );

        ExecutionValidator.validateRevisionLimit(
          milestone.revisionLimit
        );

        totalAllocation +=
          milestone.paymentAllocation;

        milestonesToCreate.push({
          projectId,

          agreementParticipantId:
            professional.agreementParticipantId,

          order: index + 1,

          allocatedDays:
            milestone.allocatedDays,

          paymentAllocation:
            milestone.paymentAllocation,

          revisionLimit:
            milestone.revisionLimit,

          createdById: userId,

          updatedById: userId,
        });
      }
    );
  }

  if (
    Number(totalAllocation) !==
    Number(agreement.budget)
  ) {
    throw new AppError(
      "Milestone payment allocation must equal the agreement budget.",
      400,
      ErrorCode.INVALID_PAYMENT_ALLOCATION
    );
  }

  await ExecutionRepository.createMilestones(
    tx,
    milestonesToCreate
  );

  const milestones =
    await ExecutionRepository.findProjectMilestones(
      tx,
      projectId
    );

  await MilestoneSpecificationService.create(
    tx,
    dto,
    milestones
  );

  await ExecutionRepository.updateSetupStage(
    tx,
    projectId,
    ProjectSetupStage.MILESTONES_CREATED
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
      ExecutionAuditAction.MILESTONE_CREATED,

    metadata: {
      professionals:
        dto.professionals.length,

      milestones:
        milestones.length,
    },
  });

  await Promise.all([
    ProjectCache.invalidate(projectId),
    MilestoneCache.invalidateExecutionPlan(
      projectId
    ),
  ]);

  return milestones;
}
}