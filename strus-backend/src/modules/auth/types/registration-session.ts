export interface RegistrationSession {
  version: 1;

  firstName: string;

  lastName: string;

  email: string;

  passwordHash: string;

  otpHash: string;

  attemptCount: number;

  resendCount: number;

  nextRetryAt: string;

  createdAt: string;
}