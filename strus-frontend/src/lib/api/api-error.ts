export const AUTH_ERROR_CODES = {
  INVALID_REQUEST: "INVALID_REQUEST",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_REVOKED: "SESSION_REVOKED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  RATE_LIMITED: "RATE_LIMITED",
  PASSWORD_NOT_SET: "PASSWORD_NOT_SET",
  INVALID_GOOGLE_TOKEN: "INVALID_GOOGLE_TOKEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_CODES;

export const mapAuthError = (code: string | undefined): string => {
  switch (code) {
    case AUTH_ERROR_CODES.INVALID_CREDENTIALS:
      return "The email or password is incorrect.";
    case AUTH_ERROR_CODES.PASSWORD_NOT_SET:
      return "This account does not have a password yet. Continue with Google or reset your password.";
    case AUTH_ERROR_CODES.INVALID_GOOGLE_TOKEN:
      return "Google authentication failed. Please try again.";
    case AUTH_ERROR_CODES.RATE_LIMITED:
      return "Too many attempts. Please try again later.";
    case AUTH_ERROR_CODES.SESSION_REVOKED:
      return "Your session has been revoked. Please sign in again.";
    case AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS:
      return "An account with this email already exists.";
    case AUTH_ERROR_CODES.INVALID_TOKEN:
      return "The verification code is invalid or has expired.";
    case AUTH_ERROR_CODES.TOKEN_EXPIRED:
      return "Your session has expired. Please sign in again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

export interface ApiFailure {
  success: false;
  message: string;
  code: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}
