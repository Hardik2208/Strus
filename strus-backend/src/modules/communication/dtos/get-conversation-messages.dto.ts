import { z } from "zod";

export const getConversationMessagesSchema = z.object({
  conversationId: z.uuid(),

  cursor: z
    .coerce
    .number()
    .int()
    .min(1)
    .optional(),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50),
});

export type GetConversationMessagesDto = z.infer<
  typeof getConversationMessagesSchema
>;