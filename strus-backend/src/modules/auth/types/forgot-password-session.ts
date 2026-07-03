export interface ForgotPasswordSession {
  email: string;

  otpHash: string;

  attemptCount: number;

  resendCount: number;

  nextRetryAt: string;

  expiresAt: string;
}