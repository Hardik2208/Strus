import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class ExecutionValidator {

  // ==================================================
  // Allocated Days
  // ==================================================

  static validateAllocatedDays(
    days: number
  ): void {
    if (!Number.isInteger(days) || days <= 0) {
      throw new AppError(
        "Invalid allocated days.",
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
    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
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
    if (
      !Number.isInteger(limit) ||
      limit < 0
    ) {
      throw new AppError(
        "Invalid revision limit.",
        400,
        ErrorCode.INVALID_REVISION_LIMIT
      );
    }
  }

  // ==================================================
  // Milestone Order
  // ==================================================

  static validateMilestoneOrder(
    order: number
  ): void {
    if (
      !Number.isInteger(order) ||
      order <= 0
    ) {
      throw new AppError(
        "Invalid milestone order.",
        400,
        ErrorCode.INVALID_MILESTONE_ORDER
      );
    }
  }
}