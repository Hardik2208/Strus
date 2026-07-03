import { z } from "zod";

import { DevicePlatform } from "../../../generated/prisma/enums.js";

export const googleLoginSchema =
  z.object({
    idToken: z
      .string()
      .min(1),

    deviceIdentifier: z
      .string()
      .trim()
      .min(1)
      .max(255),

    deviceName: z
      .string()
      .trim()
      .max(150)
      .optional(),

    platform: z.nativeEnum(
      DevicePlatform
    ),

    browser: z
      .string()
      .trim()
      .max(100)
      .optional(),

    operatingSystem: z
      .string()
      .trim()
      .max(100)
      .optional(),
  });