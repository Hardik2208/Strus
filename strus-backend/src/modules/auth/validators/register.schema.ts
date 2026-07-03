import { z } from "zod";

export const registerSchema = z.object({
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