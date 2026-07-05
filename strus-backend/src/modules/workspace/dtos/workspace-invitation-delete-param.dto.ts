import { z } from "zod";

export const workspaceInvitationDeleteParamSchema =
  z.object({
    workspaceId: z.uuid(),
    invitationId: z.uuid(),
  });

export type WorkspaceInvitationDeleteParamDto =
  z.infer<
    typeof workspaceInvitationDeleteParamSchema
  >;