import { z } from "zod";

export const getConversationsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),

  cursor: z
    .string()
    .uuid("Invalid conversation cursor.")
    .optional(),
});

export type GetConversationsDto =
  z.infer<typeof getConversationsSchema>;