import { prisma } from "../../../core/database/prisma.js";
import { ExecutionAuditAction } from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { CloudinaryService } from "../../../core/storage/cloudinary.service.js";
import { ProjectPermissionService } from "../../project/services/project-permission.service.js";
import type { CreateProjectAssetDto } from "../dtos/create-project-asset.dto.js";

import { ExecutionPermissionService } from "./execution-permission.service.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ProjectAssetRepository } from "../repositories/project-asset.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";
import { ProjectAssetValidator } from "../validators/project-asset.validator.js";
import { ProjectAssetCache } from "../cache/project-asset.cache.js";
import { ProjectAssetMapper } from "../mappers/project-asset.mapper.js";

export class ProjectAssetService {
  // ==================================================
  // Create Asset
  // ==================================================

  static async create(
    projectId: string,
    userId: string,
    dto: CreateProjectAssetDto,
    files: Express.Multer.File[]
  ) {
    ProjectAssetValidator.validateUUID(projectId, "project ID");

    // Only project client/creator can manage assets
    await ExecutionPermissionService.ensureProjectAssetManagement(
      projectId,
      userId
    );

    ProjectAssetValidator.validateFiles(files);

    const participantIds = Array.isArray(dto.visibleToParticipants)
      ? dto.visibleToParticipants
      : [dto.visibleToParticipants];

    ProjectAssetValidator.validateParticipants(participantIds);

    const uploadedFiles = await this.uploadFiles(files);

    try {
      const asset = await prisma.$transaction(async (tx) => {
        const participants =
          await ExecutionRepository.findAgreementParticipantsByIds(
            tx,
            projectId,
            participantIds
          );

        if (participants.length !== participantIds.length) {
          throw new AppError(
            "One or more professionals are invalid.",
            400,
            ErrorCode.INVALID_PROJECT_ASSET
          );
        }

        const newAsset = await ProjectAssetRepository.create(tx, {
          project: {
            connect: {
              id: projectId,
            },
          },
          createdBy: {
            connect: {
              id: userId,
            },
          },
        });

        await ProjectAssetRepository.createFiles(
          tx,
          uploadedFiles.map(({ upload, file }) => ({
            projectAssetId: newAsset.id,
            publicId: upload.publicId,
            url: upload.url,
            originalName: file.originalname,
            mimeType: file.mimetype,
            extension: upload.format || file.originalname.split(".").pop() || "",
            size: BigInt(upload.bytes),
          }))
        );

        await ProjectAssetRepository.createVisibility(
          tx,
          participants.map((participant) => ({
            projectId,
            projectAssetId: newAsset.id,
            agreementParticipantId: participant.id,
          }))
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
          action: ExecutionAuditAction.PROJECT_ASSET_CREATED,
          metadata: {
            assetId: newAsset.id,
            files: uploadedFiles.length,
            visibleTo: participantIds,
          },
        });

        return newAsset;
      });

      // Safe cache invalidation after transaction commit
      await ProjectAssetCache.invalidate(projectId);

      const createdAsset = await ProjectAssetRepository.findProjectAsset(
        projectId,
        asset.id
      );

      return ProjectAssetMapper.toResponse(createdAsset || asset);
    } catch (error) {
      // Clean up uploaded Cloudinary files on database transaction failure
      await Promise.all(
        uploadedFiles.map(({ upload }) =>
          CloudinaryService.delete(
            upload.publicId,
            upload.resourceType as "image" | "video" | "raw"
          )
        )
      );

      throw error;
    }
  }

  // ==================================================
  // Upload Files
  // ==================================================

  private static async uploadFiles(files: Express.Multer.File[]) {
    const uploaded: Array<{
      upload: Awaited<ReturnType<typeof CloudinaryService.upload>>;
      file: Express.Multer.File;
    }> = [];

    for (const file of files) {
      const resourceType = this.determineResourceType(file.mimetype);
      const upload = await CloudinaryService.upload(file.buffer, {
        folder: "strus/projects/assets",
        resourceType,
      });

      uploaded.push({
        upload,
        file,
      });
    }

    return uploaded;
  }

  // ==================================================
  // Resource Type
  // ==================================================

  private static determineResourceType(
    mimeType: string
  ): "image" | "video" | "raw" {
    if (mimeType.startsWith("image/")) {
      return "image";
    }

    if (mimeType.startsWith("video/")) {
      return "video";
    }

    return "raw";
  }

  // ==================================================
  // Get Project Assets (List)
  // ==================================================

  static async getProjectAssets(projectId: string, userId: string) {
    ProjectAssetValidator.validateUUID(projectId, "project ID");

    await ExecutionPermissionService.ensureExecutionAccess(projectId, userId);

    const project =
      await ProjectPermissionService.ensureProjectExists(projectId);

    const isCreator = project.createdById === userId;

    if (isCreator) {
      const cacheKey = ProjectAssetCache.key(projectId);
      const cached = await ProjectAssetCache.get<any[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const assets = await ProjectAssetRepository.findProjectAssets(projectId);
      const response = ProjectAssetMapper.toResponseList(assets);

      await ProjectAssetCache.set(cacheKey, response);
      return response;
    }

    // Professional access scope
    const participant = await prisma.$transaction((tx) =>
      ExecutionRepository.findAgreementParticipantByUser(tx, projectId, userId)
    );

    if (!participant) {
      throw new AppError(
        "Access denied.",
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    const cacheKey = ProjectAssetCache.key(projectId, participant.id);
    const cached = await ProjectAssetCache.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const assets = await ProjectAssetRepository.findVisibleAssets(
      projectId,
      participant.id
    );
    const response = ProjectAssetMapper.toResponseList(assets);

    await ProjectAssetCache.set(cacheKey, response);
    return response;
  }

  // ==================================================
  // Get Asset (Single)
  // ==================================================

  static async getAsset(
    projectId: string,
    assetId: string,
    userId: string
  ) {
    ProjectAssetValidator.validateUUID(projectId, "project ID");
    ProjectAssetValidator.validateUUID(assetId, "asset ID");

    await ExecutionPermissionService.ensureExecutionAccess(projectId, userId);

    const project =
      await ProjectPermissionService.ensureProjectExists(projectId);

    const asset = await ProjectAssetRepository.findProjectAsset(
      projectId,
      assetId
    );

    if (!asset || asset.deletedAt !== null) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    if (project.createdById === userId) {
      return ProjectAssetMapper.toResponse(asset);
    }

    const participant = await prisma.$transaction((tx) =>
      ExecutionRepository.findAgreementParticipantByUser(tx, projectId, userId)
    );

    if (!participant) {
      throw new AppError(
        "Access denied.",
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    const isVisible = asset.visibleToParticipants.some(
      (v) => v.agreementParticipantId === participant.id
    );

    if (!isVisible) {
      throw new AppError(
        "Access denied.",
        403,
        ErrorCode.INSUFFICIENT_PERMISSIONS
      );
    }

    return ProjectAssetMapper.toResponse(asset);
  }

  // ==================================================
  // Add Files
  // ==================================================

  static async addFiles(
    projectId: string,
    assetId: string,
    userId: string,
    files: Express.Multer.File[]
  ): Promise<void> {
    ProjectAssetValidator.validateUUID(projectId, "project ID");
    ProjectAssetValidator.validateUUID(assetId, "asset ID");

    await ExecutionPermissionService.ensureProjectAssetManagement(
      projectId,
      userId
    );

    ProjectAssetValidator.validateFiles(files);

    const asset = await ProjectAssetRepository.findProjectAsset(
      projectId,
      assetId
    );

    if (!asset || asset.deletedAt !== null) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    // Check duplicate file protection against existing files
    const existingFileNames = new Set(asset.files.map((f) => f.originalName));
    for (const file of files) {
      if (existingFileNames.has(file.originalname)) {
        throw new AppError(
          `Duplicate file "${file.originalname}" already exists in this asset.`,
          400,
          ErrorCode.DUPLICATE_PROJECT_ASSET_FILE
        );
      }
    }

    // Check maximum files limit
    if (asset.files.length + files.length > 20) {
      throw new AppError(
        "Maximum 20 files are allowed per project asset.",
        400,
        ErrorCode.INVALID_PROJECT_ASSET
      );
    }

    const uploadedFiles = await this.uploadFiles(files);

    try {
      await prisma.$transaction(async (tx) => {
        await ProjectAssetRepository.addFiles(
          tx,
          uploadedFiles.map(({ upload, file }) => ({
            projectAssetId: asset.id,
            publicId: upload.publicId,
            url: upload.url,
            originalName: file.originalname,
            mimeType: file.mimetype,
            extension: upload.format || file.originalname.split(".").pop() || "",
            size: BigInt(upload.bytes),
          }))
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
          action: ExecutionAuditAction.PROJECT_ASSET_UPDATED,
          metadata: {
            assetId: asset.id,
            addedFiles: uploadedFiles.length,
            operation: "FILES_ADDED",
          },
        });
      });

      // Safe cache invalidation after transaction commit
      await ProjectAssetCache.invalidate(projectId);
    } catch (error) {
      // Clean up uploaded Cloudinary files on transaction failure
      await Promise.all(
        uploadedFiles.map(({ upload }) =>
          CloudinaryService.delete(
            upload.publicId,
            upload.resourceType as "image" | "video" | "raw"
          )
        )
      );

      throw error;
    }
  }

  // ==================================================
  // Delete Asset
  // ==================================================

  static async delete(
    projectId: string,
    assetId: string,
    userId: string
  ): Promise<void> {
    ProjectAssetValidator.validateUUID(projectId, "project ID");
    ProjectAssetValidator.validateUUID(assetId, "asset ID");

    await ExecutionPermissionService.ensureProjectAssetManagement(
      projectId,
      userId
    );

    const asset = await ProjectAssetRepository.findProjectAsset(
      projectId,
      assetId
    );

    if (!asset || asset.deletedAt !== null) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    await prisma.$transaction(async (tx) => {
      await ProjectAssetRepository.softDelete(tx, asset.id);

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
        action: ExecutionAuditAction.PROJECT_ASSET_DELETED,
        metadata: {
          assetId: asset.id,
        },
      });
    });

    // Invalidate Redis after successful commit
    await ProjectAssetCache.invalidate(projectId);
  }
}
