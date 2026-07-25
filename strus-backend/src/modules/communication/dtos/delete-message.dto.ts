import { z } from "zod";

export const deleteMessageSchema = z.object({
  messageId: z.uuid(),
});

export type DeleteMessageDto = z.infer<
  typeof deleteMessageSchema
>;