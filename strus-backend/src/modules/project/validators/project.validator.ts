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

  static validateEstimatedBudget(
  budget?: number
): void {
  if (budget === undefined) {
    return;
  }

  if (budget <= 0) {
    throw new AppError(
      "Estimated budget must be greater than zero.",
      400,
      ErrorCode.INVALID_PROJECT_BUDGET
    );
  }
}

static validateEstimatedDuration(
  duration?: number
): void {
  if (duration === undefined) {
    return;
  }

  if (!Number.isInteger(duration) || duration <= 0) {
    throw new AppError(
      "Estimated duration must be a positive integer.",
      400,
      ErrorCode.INVALID_PROJECT_DURATION
    );
  }
}

  static validateDuration(
    duration?: number
  ): void {
    if (
      duration !== undefined &&
      duration <= 0
    ) {
      throw new AppError(
        "Invalid estimated duration.",
        400,
        ErrorCode.INVALID_PROJECT_DURATION
      );
    }
  }

  static validateExpectedDates(
    start?: Date,
    completion?: Date
  ): void {
    if (
      start &&
      completion &&
      completion < start
    ) {
      throw new AppError(
        "Expected completion date must be after expected start date.",
        400,
        ErrorCode.INVALID_PROJECT_DATES
      );
    }
  }
}