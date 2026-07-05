import { z } from "zod";

import { WorkspaceRole } from "../../../generated/prisma/enums.js";

export const updateMemberRoleSchema = z.object({
  role: z.enum([
    WorkspaceRole.ADMIN,
    WorkspaceRole.MEMBER,
  ]),
});

export type UpdateMemberRoleDto =
  z.infer<typeof updateMemberRoleSchema>;