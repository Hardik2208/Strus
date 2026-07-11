import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class ExecutionValidator {
  // ==================================================
  // Milestone Title
  // ==================================================

  static validateTitle(
    title: string
  ): void {
    if (
      title.length < 3 ||
      title.length > 200
    ) {
      throw new AppError(
        "Invalid milestone title.",
        400,
        ErrorCode.INVALID_MILESTONE_TITLE
      );
    }
  }

  // ==================================================
  // Short Description
  // ==================================================

  static validateShortDescription(
    description?: string
  ): void {
    if (
      description &&
      description.length > 500
    ) {
      throw new AppError(
        "Invalid milestone short description.",
        400,
        ErrorCode.INVALID_MILESTONE_DESCRIPTION
      );
    }
  }

  // ==================================================
  // Description
  // ==================================================

  static validateDescription(
    description: string
  ): void {
    if (
      description.length < 10 ||
      description.length > 50000
    ) {
      throw new AppError(
        "Invalid milestone description.",
        400,
        ErrorCode.INVALID_MILESTONE_DESCRIPTION
      );
    }
  }

  // ==================================================
  // Allocated Days
  // ==================================================

  static validateAllocatedDays(
    days: number
  ): void {
    if (days <= 0) {
      throw new AppError(
        "Allocated days must be greater than zero.",
        400,
        ErrorCode.INVALID_MILESTONE_DURATION
      );
    }
  }

  // ==================================================
  // Payment Allocation
  // ==================================================

  static validatePaymentAllocation(
    amount: number
  ): void {
    if (amount <= 0) {
      throw new AppError(
        "Invalid payment allocation.",
        400,
        ErrorCode.INVALID_PAYMENT_ALLOCATION
      );
    }
  }

  // ==================================================
  // Revision Limit
  // ==================================================

  static validateRevisionLimit(
    limit: number
  ): void {
    if (limit < 0) {
      throw new AppError(
        "Invalid revision limit.",
        400,
        ErrorCode.INVALID_REVISION_LIMIT
      );
    }
  }
}