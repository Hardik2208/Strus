export const AuthConstants = {
  REGISTRATION_TTL_SECONDS: 60 * 60,

  OTP_LENGTH: 6,

  OTP_MAX_ATTEMPTS: 5,

  RESEND_BACKOFF_MINUTES: [
    1,
    2,
    4,
    8,
    15,
    30,
  ] as const,
} as const;