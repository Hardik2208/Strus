import { z } from "zod";

export const updateProjectSchema = z.object({
  title: z
  .string()
  .trim()
  .min(3)
  .max(120)
  .optional(),

description: z
  .string()
  .trim()
  .max(2000)
  .optional(),
});

export type UpdateProjectDto = z.infer<
  typeof updateProjectSchema
>;