import { z } from "zod";

export const verifyEmailSchema =
  z.object({
    email: z
      .string()
      .email(),

    otp: z
      .string()
      .regex(/^\d{6}$/),

    deviceIdentifier: z
      .string()
      .min(1),

    deviceName: z
      .string()
      .optional(),

    platform: z.enum([
      "WEB",
      "WINDOWS",
      "MACOS",
      "LINUX",
      "IOS",
      "ANDROID",
    ]),

    browser: z
      .string()
      .optional(),

    operatingSystem: z
      .string()
      .optional(),
  });

export type VerifyEmailDto =
  z.infer<
    typeof verifyEmailSchema
  >;