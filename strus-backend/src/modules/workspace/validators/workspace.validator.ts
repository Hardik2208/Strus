import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class WorkspaceValidator {
  static validateName(name: string): void {
    const value = name.trim();

    if (value.length < 3) {
      throw new AppError(
        "Workspace name must be at least 3 characters.",
        400,
        ErrorCode.INVALID_WORKSPACE_NAME
      );
    }

    if (value.length > 100) {
      throw new AppError(
        "Workspace name cannot exceed 100 characters.",
        400,
        ErrorCode.INVALID_WORKSPACE_NAME
      );
    }
  }

  static validateDescription(
    description?: string | null
  ): void {
    if (
      description &&
      description.trim().length > 1000
    ) {
      throw new AppError(
        "Workspace description cannot exceed 1000 characters.",
        400,
        ErrorCode.INVALID_WORKSPACE_DESCRIPTION
      );
    }
  }
}