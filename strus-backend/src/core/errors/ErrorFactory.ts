import { AppError } from "./AppError.js";
import { ErrorCode } from "./ErrorCodes.js";

export class ErrorFactory {
  static badRequest(message: string) {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  static notFound(message = "Resource not found") {
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  static conflict(message: string) {
    return new AppError(message, 409, ErrorCode.CONFLICT);
  }

  static validation(message: string) {
    return new AppError(message, 422, ErrorCode.VALIDATION_ERROR);
  }

  static internal(message = "Internal server error") {
    return new AppError(
      message,
      500,
      ErrorCode.INTERNAL_SERVER_ERROR,
      false
    );
  }
}