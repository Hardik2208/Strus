import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email(),

  password: z
    .string()
    .min(8),

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

export type LoginDto =
  z.infer<typeof loginSchema>;