import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class MilestoneDependencyValidator {
  // ==================================================
  // Self Dependency
  // ==================================================

  static validateSelfDependency(
    milestoneId: string,
    dependsOnMilestoneId: string
  ): void {
    if (
      milestoneId === dependsOnMilestoneId
    ) {
      throw new AppError(
        "A milestone cannot depend on itself.",
        400,
        ErrorCode.INVALID_MILESTONE_DEPENDENCY
      );
    }
  }
}