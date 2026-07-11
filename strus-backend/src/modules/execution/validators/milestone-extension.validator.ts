import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class MilestoneExtensionValidator {
  static validateDays(
    days: number
  ): void {
    if (
      !Number.isInteger(days) ||
      days <= 0
    ) {
      throw new AppError(
        "Invalid extension days.",
        400,
        ErrorCode.INVALID_EXTENSION_DAYS
      );
    }
  }

  static validateReason(
    reason: string
  ): void {
    const value = reason.trim();

    if (
      value.length < 10 ||
      value.length > 5000
    ) {
      throw new AppError(
        "Invalid extension reason.",
        400,
        ErrorCode.INVALID_EXTENSION_REASON
      );
    }
  }
}