import { z } from "zod";

export const checkUsernameSchema = z.object({
  username: z.string().trim().min(3).max(30),
});

export type CheckUsernameDto = z.infer<typeof checkUsernameSchema>;