import { z } from "zod";

import { ProjectStatus } from "../../../generated/prisma/enums.js";

export const updateProjectStatusSchema =
  z.object({
    status: z.nativeEnum(ProjectStatus),
  });

export type UpdateProjectStatusDto =
  z.infer<
    typeof updateProjectStatusSchema
  >;