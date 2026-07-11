import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class ProjectAssetValidator {
  private static readonly MAX_FILES = 20;

  // ==================================================
  // Files
  // ==================================================

  static validateFiles(
    files: Express.Multer.File[]
  ): void {
    if (!files || files.length === 0) {
      throw new AppError(
        "At least one file is required.",
        400,
        ErrorCode.INVALID_PROJECT_ASSET
      );
    }

    if (
      files.length >
      ProjectAssetValidator.MAX_FILES
    ) {
      throw new AppError(
        `Maximum ${ProjectAssetValidator.MAX_FILES} files are allowed.`,
        400,
        ErrorCode.INVALID_PROJECT_ASSET
      );
    }

    const duplicateNames =
      new Set<string>();

    for (const file of files) {
      if (
        duplicateNames.has(
          file.originalname
        )
      ) {
        throw new AppError(
          "Duplicate files are not allowed.",
          400,
          ErrorCode.DUPLICATE_PROJECT_ASSET_FILE
        );
      }

      duplicateNames.add(
        file.originalname
      );
    }
  }

  // ==================================================
  // Participants
  // ==================================================

  static validateParticipants(
    participantIds: string[]
  ): void {
    if (
      participantIds.length === 0
    ) {
      throw new AppError(
        "Select at least one professional.",
        400,
        ErrorCode.INVALID_PROJECT_ASSET
      );
    }

    const uniqueIds =
      new Set<string>();

    for (const id of participantIds) {
      if (uniqueIds.has(id)) {
        throw new AppError(
          "Duplicate participant selected.",
          400,
          ErrorCode.DUPLICATE_PROJECT_ASSET_PARTICIPANT
        );
      }

      uniqueIds.add(id);
    }
  }
}