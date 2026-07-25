// communication/dtos/update-message.dto.ts

import { z } from "zod";

export const updateMessageSchema = z.object({
  messageId: z.uuid(),

  content: z
    .string()
    .trim()
    .min(1, "Message content is required.")
    .max(4000),
});

export type UpdateMessageDto = z.infer<
  typeof updateMessageSchema
>;