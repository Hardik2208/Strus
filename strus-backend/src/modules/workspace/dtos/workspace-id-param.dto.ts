import { z } from "zod";

export const workspaceIdParamSchema = z.object({
  workspaceId: z.uuid(),
});

export type WorkspaceIdParamDto = z.infer<
  typeof workspaceIdParamSchema
>;