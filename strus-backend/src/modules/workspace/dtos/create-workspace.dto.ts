import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Workspace name must be at least 3 characters.")
    .max(100, "Workspace name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional(),
});

export type CreateWorkspaceDto = z.infer<
  typeof createWorkspaceSchema
>;