import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  lastName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: z
    .string()
    .trim()
    .email(),

  password: z
    .string()
    .min(8)
    .max(100),
});

export type RegisterDto =
  z.infer<typeof registerSchema>;