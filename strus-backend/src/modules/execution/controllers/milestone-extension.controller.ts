import type {
  NextFunction,
  Response,
} from "express";

import { prisma } from "../../../core/database/prisma.js";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import { ExecutionPublisher } from "../../event/publishers/execution.publisher.js";
import type { CreateMilestoneExtensionDto } from "../dtos/create-milestone-extension.dto.js";
import { MilestoneExtensionService } from "../services/milestone-extension.service.js";

export class MilestoneExtensionController {
  // ==================================================
  // Grant Extension
  // ==================================================

  static async create(
    req: AuthenticatedRequest<
      { projectId: string },
      unknown,
      CreateMilestoneExtensionDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      const userId = req.user.id;

      const result =
  await prisma.$transaction((tx) =>
    MilestoneExtensionService.create(
      tx,
      projectId,
      userId,
      req.body
    )
  );

      await ExecutionPublisher.publishExtensionGranted({

  createdById: userId,

  projectId,

  milestoneId:
    result.extension.milestoneId,

  extensionId:
    result.extension.id,

  agreementParticipantId:
    result.agreementParticipantId,

});

      res.status(201).json({
  success: true,

  message:
    "Milestone extension granted successfully.",

  data:
    result.extension,
});
    } catch (error) {
      next(error);
    }
  }
}