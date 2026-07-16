import { prisma } from "../../../core/database/prisma.js";

import type {
  ProjectAsset,
} from "../../../generated/prisma/client.js";
import util from "node:util";

import type { Prisma } from "../../../generated/prisma/client.js";
import {
  ExecutionAuditAction,
} from "../../../generated/prisma/enums.js";

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
  await ExecutionPermissionService.ensureExecutionAccess(
    projectId,
    userId
  );

  ProjectAssetValidator.validateFiles(
    files
  );

  const participantIds = Array.isArray(
    dto.visibleToParticipants
  )
    ? dto.visibleToParticipants
    : [dto.visibleToParticipants];

  ProjectAssetValidator.validateParticipants(
    participantIds
  );

  const uploadedFiles =
    await this.uploadFiles(files);

  try {
    const asset =
      await prisma.$transaction(
        async (tx) => {
          const participants =
            await ExecutionRepository.findAgreementParticipantsByIds(
              tx,
              projectId,
              participantIds
            );

          if (
            participants.length !==
            participantIds.length
          ) {
            throw new AppError(
              "One or more professionals are invalid.",
              400,
              ErrorCode.INVALID_PROJECT_ASSET
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
              (participant) => ({
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
                assetId: asset.id,
                files:
                  uploadedFiles.length,
                visibleTo:
                  participantIds,
              },
            }
          );

          return asset;
        }
      );

    await ProjectAssetCache.invalidate(
      projectId
    );

    return asset;
  } catch (error) {
    await Promise.all(
      uploadedFiles.map(
        ({ upload }) =>
          CloudinaryService.delete(
            upload.publicId,
            this.determineResourceType(
              upload.format.startsWith("mp4") ||
                upload.format.startsWith(
                  "mov"
                ) ||
                upload.format.startsWith(
                  "avi"
                ) ||
                upload.format.startsWith(
                  "mkv"
                )
                ? "video/mp4"
                : "image/png"
            )
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

const project =
  await ProjectPermissionService.ensureProjectExists(
    projectId
);

if (project.createdById === userId) {
  return ProjectAssetRepository.findProjectAssets(
    projectId
  );
}

const participant =
  await prisma.$transaction((tx) =>
    ExecutionRepository.findAgreementParticipantByUser(
      tx,
      projectId,
      userId
    )
  );

if (!participant) {
  throw new AppError(
    "Access denied.",
    403,
    ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

return ProjectAssetRepository.findVisibleAssets(
  projectId,
  participant.id
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

const project =
  await ProjectPermissionService.ensureProjectExists(
    projectId
);

let asset;

if (project.createdById === userId) {
  asset =
    await ProjectAssetRepository.findProjectAsset(
      projectId,
      assetId
    );
} else {
  const participant =
    await prisma.$transaction((tx) =>
      ExecutionRepository.findAgreementParticipantByUser(
        tx,
        projectId,
        userId
      )
    );

  if (!participant) {
    throw new AppError(
      "Access denied.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  asset =
    await ProjectAssetRepository.findVisibleAsset(
      projectId,
      assetId,
      participant.id
    );
}

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
    await ExecutionPermissionService.ensureProjectAssetManagement(
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
    await ExecutionPermissionService.ensureProjectAssetManagement(
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