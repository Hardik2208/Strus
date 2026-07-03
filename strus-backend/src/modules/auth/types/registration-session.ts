export interface RegistrationSession {
  version: 1;

  email: string;

  passwordHash: string;

  otpHash: string;

  attemptCount: number;

  resendCount: number;

  nextRetryAt: string;

  createdAt: string;
}