import { z } from "zod";

import { ProjectAuditAction } from "../../../generated/prisma/enums.js";

export const listProjectAuditsQuerySchema =
  z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    action: z
      .nativeEnum(ProjectAuditAction)
      .optional(),

    order: z
      .enum(["asc", "desc"])
      .default("desc"),
  });

export type ListProjectAuditsDto =
  z.infer<
    typeof listProjectAuditsQuerySchema
  >;