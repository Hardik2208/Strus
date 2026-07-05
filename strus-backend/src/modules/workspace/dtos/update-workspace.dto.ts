import { z } from "zod";

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(100, "Workspace name cannot exceed 100 characters.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Workspace description cannot exceed 1000 characters.")
    .nullable()
    .optional(),
});

export type UpdateWorkspaceDto = z.infer<
  typeof updateWorkspaceSchema
>;