export const RedisKeys = {
  signup: (email: string) =>
    `signup:${email.toLowerCase()}`,

  loginAttempts: (email: string) =>
    `login-attempts:${email.toLowerCase()}`,

  passwordReset: (email: string) =>
    `password-reset:${email.toLowerCase()}`,
} as const;