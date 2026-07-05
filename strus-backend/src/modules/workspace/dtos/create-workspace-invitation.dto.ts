import { z } from "zod";

import { WorkspaceRole } from "../../../generated/prisma/enums.js";

export const createWorkspaceInvitationSchema =
  z.object({
    identifier: z.email(),
  });

export type CreateWorkspaceInvitationDto =
  z.infer<
    typeof createWorkspaceInvitationSchema
  >;