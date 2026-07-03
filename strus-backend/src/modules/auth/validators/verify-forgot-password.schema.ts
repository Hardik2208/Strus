import { z } from "zod";

export const verifyForgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email address."),

    otp: z
      .string()
      .trim()
      .length(
        6,
        "Verification code must be 6 digits."
      )
      .regex(
        /^\d+$/,
        "Verification code must contain only numbers."
      ),
  });

export type VerifyForgotPasswordInput =
  z.infer<
    typeof verifyForgotPasswordSchema
  >;