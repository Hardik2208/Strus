import { z } from "zod";

export const resetPasswordSchema =
  z.object({
    resetToken: z
      .string()
      .trim()
      .min(1, "Reset token is required."),

    newPassword: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters."
      )
      .max(
        128,
        "Password is too long."
      )
      .regex(
        /^(?=.*[a-z])/,
        "Password must contain one lowercase letter."
      )
      .regex(
        /^(?=.*[A-Z])/,
        "Password must contain one uppercase letter."
      )
      .regex(
        /^(?=.*\d)/,
        "Password must contain one number."
      )
      .regex(
        /^(?=.*[@$!%*?&])/,
        "Password must contain one special character."
      ),
  });

export type ResetPasswordInput =
  z.infer<typeof resetPasswordSchema>;