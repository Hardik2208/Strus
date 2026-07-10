import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class AgreementValidator {
  static validateTitle(title: string): void {
    if (title.length < 3 || title.length > 150) {
      throw new AppError(
        "Invalid agreement title.",
        400,
        ErrorCode.INVALID_AGREEMENT_TITLE
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
        "Invalid agreement description.",
        400,
        ErrorCode.INVALID_AGREEMENT_DESCRIPTION
      );
    }
  }

  static validateScope(
    scope?: string
  ): void {
    if (
      scope &&
      scope.length > 10000
    ) {
      throw new AppError(
        "Invalid agreement scope.",
        400,
        ErrorCode.INVALID_AGREEMENT_SCOPE
      );
    }
  }

  static validateOutOfScope(
    outOfScope?: string
  ): void {
    if (
      outOfScope &&
      outOfScope.length > 10000
    ) {
      throw new AppError(
        "Invalid agreement out of scope.",
        400,
        ErrorCode.INVALID_AGREEMENT_OUT_OF_SCOPE
      );
    }
  }

  static validateBudget(
    budget: number
  ): void {
    if (budget <= 0) {
      throw new AppError(
        "Invalid agreement budget.",
        400,
        ErrorCode.INVALID_AGREEMENT_BUDGET
      );
    }
  }

  static validateExpectedDuration(
    expectedDuration: number
  ): void {
    if (expectedDuration <= 0) {
      throw new AppError(
        "Invalid expected duration.",
        400,
        ErrorCode.INVALID_AGREEMENT_DURATION
      );
    }
  }
}