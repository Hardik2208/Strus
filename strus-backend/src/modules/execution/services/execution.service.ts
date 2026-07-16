import type { Prisma } from "../../../generated/prisma/client.js";

import {
  ProjectSetupStage,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import {
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";

export class ExecutionService {
  // ==================================================
  // Validate Project Ready To Start
  // ==================================================

  static async ensureProjectReady(
    tx: Prisma.TransactionClient,
    projectId: string
  ): Promise<void> {
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

    const milestones =
      await ExecutionRepository.findProjectMilestones(
        tx,
        projectId
      );

    if (milestones.length === 0) {
      throw new AppError(
        "Execution plan has not been created.",
        400,
        ErrorCode.INVALID_PROJECT_SETUP_STAGE
      );
    }

    let totalAllocation = 0;

    for (const milestone of milestones) {
      totalAllocation += Number(
        milestone.paymentAllocation
      );
    }

    if (
      totalAllocation !==
      Number(agreement.budget)
    ) {
      throw new AppError(
        "Milestone payment allocation must equal the agreement budget.",
        400,
        ErrorCode.INVALID_PAYMENT_ALLOCATION
      );
    }

    // TODO
    // Validate milestone specifications

    // TODO
    // Validate dependencies

    // TODO
    // Validate project assets

    await ExecutionRepository.updateSetupStage(
      tx,
      projectId,
      ProjectSetupStage.READY_TO_START
    );
  }

  // ==================================================
// Start Execution
// ==================================================

static async startExecution(
  tx: Prisma.TransactionClient,
  projectId: string
): Promise<void> {

  const now = new Date();

  await ExecutionRepository.startFirstMilestones(
    tx,
    projectId,
    now
  );
}

}