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

  static profileAlreadyCompleted() {
  return new AppError(
    "Profile has already been completed.",
    409,
    ErrorCode.PROFILE_ALREADY_COMPLETED
  );
}

static profileNotFound() {
  return new AppError(
    "Profile not found.",
    404,
    ErrorCode.PROFILE_NOT_FOUND
  );
}

static usernameAlreadyExists() {
  return new AppError(
    "Username is already taken.",
    409,
    ErrorCode.USERNAME_ALREADY_EXISTS
  );
}

static usernameReserved() {
  return new AppError(
    "Username is reserved.",
    400,
    ErrorCode.USERNAME_UNAVAILABLE
  );
}

static usernameProhibited() {
  return new AppError(
    "Username contains prohibited words.",
    400,
    ErrorCode.USERNAME_UNAVAILABLE
  );
}

static invalidUsername() {
  return new AppError(
    "Invalid username.",
    400,
    ErrorCode.INVALID_USERNAME
  );
}

static invalidCountryCode() {
  return new AppError(
    "Invalid country code.",
    400,
    ErrorCode.INVALID_COUNTRY_CODE
  );
}

static invalidTimezone() {
  return new AppError(
    "Invalid timezone.",
    400,
    ErrorCode.INVALID_TIMEZONE
  );
}
}