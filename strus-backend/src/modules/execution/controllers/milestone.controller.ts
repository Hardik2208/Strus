import type {
  NextFunction,
  Response,
} from "express";

import { prisma } from "../../../core/database/prisma.js";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import type { CreateExecutionPlanDto } from "../dtos/create-execution-plan.dto.js";

import { MilestoneService } from "../services/execution-plan.service.js";
import { ExecutionMapper } from "../mappers/execution.mapper.js";

export class MilestoneController {
  // ==================================================
  // Create Execution Plan
  // ==================================================

  static async createPlan(
    req: AuthenticatedRequest<
      { projectId: string },
      unknown,
      CreateExecutionPlanDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      const userId = req.user.id;

      const dto =
        req.body as CreateExecutionPlanDto;

      const milestones =
        await prisma.$transaction(
          (tx) =>
            MilestoneService.createExecutionPlan(
              tx,
              projectId,
              userId,
              dto
            )
        );

      res.status(201).json({
        success: true,

        message:
          "Execution plan created successfully.",

        data:
          ExecutionMapper.toExecutionPlanResponse(
            milestones
          ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Get Execution Plan
  // ==================================================

  static async getPlan(
    req: AuthenticatedRequest<{
      projectId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } =
        req.params;

      const userId =
        req.user.id;

      const milestones =
        await prisma.$transaction(
          (tx) =>
            MilestoneService.getExecutionPlan(
              tx,
              projectId,
              userId
            )
        );

      res.status(200).json({
        success: true,

        data:
          ExecutionMapper.toExecutionPlanResponse(
            milestones
          ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Update Execution Plan
  // ==================================================

  static async updatePlan(
    req: AuthenticatedRequest<
      { projectId: string },
      unknown,
      CreateExecutionPlanDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } =
        req.params;

      const userId =
        req.user.id;

      const dto =
        req.body as CreateExecutionPlanDto;

      const milestones =
        await prisma.$transaction(
          (tx) =>
            MilestoneService.updateExecutionPlan(
              tx,
              projectId,
              userId,
              dto
            )
        );

      res.status(200).json({
        success: true,

        message:
          "Execution plan updated successfully.",

        data:
          ExecutionMapper.toExecutionPlanResponse(
            milestones
          ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Delete Execution Plan
  // ==================================================

  static async deletePlan(
    req: AuthenticatedRequest<{
      projectId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } =
        req.params;

      const userId =
        req.user.id;

      await prisma.$transaction(
        (tx) =>
          MilestoneService.deletePlan(
            tx,
            projectId,
            userId
          )
      );

      res.status(200).json({
        success: true,

        message:
          "Execution plan deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}