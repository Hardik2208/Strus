import { z } from "zod";

import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "../constants/username.constants.js";

export const createProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(
      USERNAME_MIN_LENGTH,
      `Username must be at least ${USERNAME_MIN_LENGTH} characters.`
    )
    .max(
      USERNAME_MAX_LENGTH,
      `Username cannot exceed ${USERNAME_MAX_LENGTH} characters.`
    )
    .regex(USERNAME_REGEX, "Invalid username format."),

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50, "First name cannot exceed 50 characters."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(50, "Last name cannot exceed 50 characters."),

  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters.")
    .optional(),

  countryCode: z
    .string()
    .trim()
    .length(2, "Country code must be a valid ISO Alpha-2 code.")
    .transform((value) => value.toUpperCase()),

  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required."),
});

export type CreateProfileDto = z.infer<typeof createProfileSchema>;