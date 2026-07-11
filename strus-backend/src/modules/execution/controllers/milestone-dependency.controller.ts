import type {
  NextFunction,
  Response,
} from "express";

import { prisma } from "../../../core/database/prisma.js";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import type { CreateMilestoneDependencyDto } from "../dtos/create-milestone-dependency.dto.js";

import { MilestoneDependencyService } from "../services/milestone-dependency.service.js";

export class MilestoneDependencyController {
  // ==================================================
  // Create Dependency
  // ==================================================

  static async create(
    req: AuthenticatedRequest<
      { projectId: string },
      unknown,
      CreateMilestoneDependencyDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } = req.params;

      const userId = req.user.id;

      const dependency =
        await prisma.$transaction((tx) =>
          MilestoneDependencyService.create(
            tx,
            projectId,
            userId,
            req.body
          )
        );

      res.status(201).json({
        success: true,

        message:
          "Milestone dependency created successfully.",

        data: dependency,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Delete Dependency
  // ==================================================

  static async delete(
    req: AuthenticatedRequest<{
      projectId: string;
      dependencyId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId, dependencyId } =
        req.params;

      const userId = req.user.id;

      await prisma.$transaction((tx) =>
        MilestoneDependencyService.delete(
          tx,
          projectId,
          dependencyId,
          userId
        )
      );

      res.status(200).json({
        success: true,

        message:
          "Milestone dependency deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}