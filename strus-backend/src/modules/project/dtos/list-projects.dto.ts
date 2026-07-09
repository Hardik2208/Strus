import { z } from "zod";

import { ProjectStatus } from "../../../generated/prisma/enums.js";

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  status: z.nativeEnum(ProjectStatus).optional(),

  sort: z.enum([
    "createdAt",
    "title",
    "expectedStartDate",
    "expectedCompletionDate",
  ]).default("createdAt"),

  order: z.enum([
    "asc",
    "desc",
  ]).default("desc"),
});

export type ListProjectsDto = z.infer<
  typeof listProjectsQuerySchema
>;