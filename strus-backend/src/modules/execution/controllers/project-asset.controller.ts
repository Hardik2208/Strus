import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import type { CreateProjectAssetDto } from "../dtos/create-project-asset.dto.js";

import { ProjectAssetService } from "../services/project-asset.service.js";

export class ProjectAssetController {
  // ==================================================
  // Create
  // ==================================================

  static async create(
    req: AuthenticatedRequest<
      { projectId: string },
      unknown,
      CreateProjectAssetDto
    >,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const asset =
        await ProjectAssetService.create(
          req.params.projectId,
          req.user.id,
          req.body,
          (req.files ??
            []) as Express.Multer.File[]
        );

      res.status(201).json({
        success: true,

        message:
          "Project asset created successfully.",

        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // List
  // ==================================================

  static async list(
    req: AuthenticatedRequest<{
      projectId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const assets =
        await ProjectAssetService.getProjectAssets(
          req.params.projectId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        data: assets,
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
      projectId: string;
      assetId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const asset =
        await ProjectAssetService.getAsset(
          req.params.projectId,
          req.params.assetId,
          req.user.id
        );

      res.status(200).json({
        success: true,

        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Add Files
  // ==================================================

  static async addFiles(
    req: AuthenticatedRequest<{
      projectId: string;
      assetId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProjectAssetService.addFiles(
        req.params.projectId,
        req.params.assetId,
        req.user.id,
        (req.files ??
          []) as Express.Multer.File[]
      );

      res.status(200).json({
        success: true,

        message:
          "Files added successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Delete
  // ==================================================

  static async delete(
    req: AuthenticatedRequest<{
      projectId: string;
      assetId: string;
    }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProjectAssetService.delete(
        req.params.projectId,
        req.params.assetId,
        req.user.id
      );

      res.status(200).json({
        success: true,

        message:
          "Project asset deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}