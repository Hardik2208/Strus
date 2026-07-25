import { z } from "zod";
import { MessageType } from "../../../generated/prisma/enums.js";

export const sendMessageSchema = z.object({
  conversationId: z.uuid(),

  content: z
    .string()
    .trim()
    .max(4000)
    .optional(),

  type: z.nativeEnum(MessageType),

  replyToMessageId: z
    .uuid()
    .optional(),
});

export type SendMessageDto =
  z.infer<typeof sendMessageSchema>;