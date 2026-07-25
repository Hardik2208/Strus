import { z } from "zod";

export const MarkConversationReadSchema = z.object({
  conversationId: z
    .uuid("Invalid conversation ID."),

  lastReadSequence: z
    .number({
      error: "Last read sequence must be a number.",
    })
    .int("Last read sequence must be an integer.")
    .min(1, "Last read sequence must be greater than 0."),
});

export type MarkConversationReadDto = z.infer<
  typeof MarkConversationReadSchema
>;