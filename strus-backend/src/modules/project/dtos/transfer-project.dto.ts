import { z } from "zod";

export const transferProjectSchema = z.object({
  destinationWorkspaceId: z
    .string()
    .uuid(),
});

export type TransferProjectDto = z.infer<
  typeof transferProjectSchema
>;