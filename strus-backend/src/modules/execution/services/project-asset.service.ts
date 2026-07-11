import { prisma } from "../../../core/database/prisma.js";

import type {
  ProjectAsset,
} from "../../../generated/prisma/client.js";

import {
  ExecutionAuditAction,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { CloudinaryService } from "../../../core/storage/cloudinary.service.js";

import type { CreateProjectAssetDto } from "../dtos/create-project-asset.dto.js";

import { ExecutionPermissionService } from "./execution-permission.service.js";

import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ProjectAssetRepository } from "../repositories/project-asset.repository.js";
import { ExecutionAuditRepository } from "../repositories/execution-audit.repository.js";

import { ProjectAssetValidator } from "../validators/project-asset.validator.js";

import { ProjectAssetCache } from "../cache/project-asset.cache.js";

export class ProjectAssetService {
  // ==================================================
  // Create Asset
  // ==================================================

  static async create(
    projectId: string,
    userId: string,
    dto: CreateProjectAssetDto,
    files: Express.Multer.File[]
  ): Promise<ProjectAsset> {
    await ExecutionPermissionService.ensureExecutionPlanEditable(
      projectId,
      userId
    );

    ProjectAssetValidator.validateParticipants(
      dto.visibleToParticipants
    );

    ProjectAssetValidator.validateFiles(
      files
    );

    const uploadedFiles =
      await this.uploadFiles(files);

    try {
      return await prisma.$transaction(
        async (tx) => {
          const participants =
            await ExecutionRepository.findAgreementParticipantsByIds(
              tx,
              projectId,
              dto.visibleToParticipants
            );

          if (
            participants.length !==
            dto.visibleToParticipants.length
          ) {
            throw new AppError(
              "Invalid participants selected.",
              400,
              ErrorCode.INVALID_REQUEST
            );
          }

          const asset =
            await ProjectAssetRepository.create(
              tx,
              {
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
              }
            );

          await ProjectAssetRepository.createFiles(
            tx,
            uploadedFiles.map(
              ({
                upload,
                file,
              }) => ({
                projectAssetId:
                  asset.id,

                publicId:
                  upload.publicId,

                url:
                  upload.url,

                originalName:
                  file.originalname,

                mimeType:
                  file.mimetype,

                extension:
                  upload.format,

                size: BigInt(
                  upload.bytes
                ),
              })
            )
          );

          await ProjectAssetRepository.createVisibility(
            tx,
            participants.map(
              (
                participant
              ) => ({
                projectId,

                projectAssetId:
                  asset.id,

                agreementParticipantId:
                  participant.id,
              })
            )
          );

          await ExecutionAuditRepository.create(
            tx,
            {
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
                ExecutionAuditAction.PROJECT_ASSET_CREATED,

              metadata: {
                assetId:
                  asset.id,

                files:
                  uploadedFiles.length,
              },
            }
          );

          await ProjectAssetCache.invalidate(
            projectId
          );

          return asset;
        }
      );
    } catch (error) {
      await Promise.all(
        uploadedFiles.map(
          ({ upload }) =>
            CloudinaryService.delete(
              upload.publicId
            )
        )
      );

      throw error;
    }
  }

  // ==================================================
  // Upload Files
  // ==================================================

  private static async uploadFiles(
    files: Express.Multer.File[]
  ) {
    const uploaded: Array<{
      upload: Awaited<
        ReturnType<
          typeof CloudinaryService.upload
        >
      >;

      file: Express.Multer.File;
    }> = [];

    for (const file of files) {
      const upload =
        await CloudinaryService.upload(
          file.buffer,
          {
            folder:
              "strus/projects/assets",

            resourceType:
              this.determineResourceType(
                file.mimetype
              ),
          }
        );

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
  // Get Project Assets
  // ==================================================

  static async getProjectAssets(
    projectId: string,
    userId: string
  ) {
    await ExecutionPermissionService.ensureExecutionAccess(
      projectId,
      userId
    );

    return ProjectAssetRepository.findProjectAssets(
      projectId
    );
  }

  // ==================================================
  // Get Asset
  // ==================================================

  static async getAsset(
    projectId: string,
    assetId: string,
    userId: string
  ) {
    await ExecutionPermissionService.ensureExecutionAccess(
      projectId,
      userId
    );

    const asset =
      await ProjectAssetRepository.findProjectAsset(
        projectId,
        assetId
      );

    if (!asset) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    return asset;
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
    await ExecutionPermissionService.ensureExecutionPlanEditable(
      projectId,
      userId
    );

    ProjectAssetValidator.validateFiles(
      files
    );

    const asset =
      await ProjectAssetRepository.findProjectAsset(
        projectId,
        assetId
      );

    if (!asset) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    const uploadedFiles =
      await this.uploadFiles(files);

    try {
      await prisma.$transaction(
        async (tx) => {
          await ProjectAssetRepository.addFiles(
            tx,
            uploadedFiles.map(
              ({
                upload,
                file,
              }) => ({
                projectAssetId:
                  asset.id,

                publicId:
                  upload.publicId,

                url:
                  upload.url,

                originalName:
                  file.originalname,

                mimeType:
                  file.mimetype,

                extension:
                  upload.format,

                size: BigInt(
                  upload.bytes
                ),
              })
            )
          );

          await ExecutionAuditRepository.create(
            tx,
            {
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
                ExecutionAuditAction.PROJECT_ASSET_UPDATED,

              metadata: {
                assetId:
                  asset.id,

                addedFiles:
                  uploadedFiles.length,
              },
            }
          );

          await ProjectAssetCache.invalidate(
            projectId
          );
        }
      );
    } catch (error) {
      await Promise.all(
        uploadedFiles.map(
          ({ upload }) =>
            CloudinaryService.delete(
              upload.publicId
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
    await ExecutionPermissionService.ensureExecutionPlanEditable(
      projectId,
      userId
    );

    const asset =
      await ProjectAssetRepository.findProjectAsset(
        projectId,
        assetId
      );

    if (!asset) {
      throw new AppError(
        "Project asset not found.",
        404,
        ErrorCode.PROJECT_ASSET_NOT_FOUND
      );
    }

    const files =
      await ProjectAssetRepository.findFiles(
        asset.id
      );

    try {
      await prisma.$transaction(
        async (tx) => {
          await ProjectAssetRepository.deleteVisibility(
            tx,
            asset.id
          );

          await ProjectAssetRepository.softDelete(
            tx,
            asset.id
          );

          await ExecutionAuditRepository.create(
            tx,
            {
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
                ExecutionAuditAction.PROJECT_ASSET_DELETED,

              metadata: {
                assetId: asset.id,
              },
            }
          );

          await ProjectAssetCache.invalidate(
            projectId
          );
        }
      );

      await Promise.all(
        files.map((file) =>
          CloudinaryService.delete(
            file.publicId
          )
        )
      );
    } catch (error) {
      throw error;
    }
  }
}