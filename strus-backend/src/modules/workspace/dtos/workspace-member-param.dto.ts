import { z } from "zod";

export const workspaceMemberParamSchema =
  z.object({
    workspaceId: z.uuid(),
    memberId: z.uuid(),
  });

export type WorkspaceMemberParamDto =
  z.infer<
    typeof workspaceMemberParamSchema
  >;