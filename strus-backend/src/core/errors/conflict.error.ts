import { AppError } from "./AppError.js";
import { ErrorCode } from "./ErrorCodes.js";

export class ConflictError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.CONFLICT
  ) {
    super(message, 409, code);
  }
}