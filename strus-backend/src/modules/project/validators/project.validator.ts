import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class ProjectValidator {
  static validateTitle(title: string): void {
    if (title.length < 3 || title.length > 150) {
      throw new AppError(
        "Invalid project title.",
        400,
        ErrorCode.INVALID_PROJECT_TITLE
      );
    }
  }

  static validateDescription(
    description?: string
  ): void {
    if (
      description &&
      description.length > 5000
    ) {
      throw new AppError(
        "Invalid project description.",
        400,
        ErrorCode.INVALID_PROJECT_DESCRIPTION
      );
    }
  }
}