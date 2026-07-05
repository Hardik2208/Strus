import { z } from "zod";

export const removeMemberParamSchema =
  z.object({
    workspaceId: z.uuid(),
    memberId: z.uuid(),
  });

export type RemoveMemberParamDto =
  z.infer<
    typeof removeMemberParamSchema
  >;