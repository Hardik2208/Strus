import { z } from "zod";

export const getReadReceiptsSchema = z.object({
  messageId: z.uuid("Invalid message ID."),
});

export type GetReadReceiptsDto =
  z.infer<typeof getReadReceiptsSchema>;