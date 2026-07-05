import { z } from "zod";

export const workspaceInvitationParamSchema =
  z.object({
    invitationId: z.uuid(),
  });

export type WorkspaceInvitationParamDto =
  z.infer<
    typeof workspaceInvitationParamSchema
  >;