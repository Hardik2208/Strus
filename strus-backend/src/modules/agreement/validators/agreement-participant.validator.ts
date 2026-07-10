import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class AgreementParticipantValidator {
  static validateProfessionalId(
    professionalId: string
  ): void {
    if (!professionalId.trim()) {
      throw new AppError(
        "Professional id is required.",
        400,
        ErrorCode.INVALID_USER_ID
      );
    }
  }
}