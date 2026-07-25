import { z } from "zod";

export const getMessageSchema = z.object({
  messageId: z.uuid(),
});

export type GetMessageDto = z.infer<
  typeof getMessageSchema
>;