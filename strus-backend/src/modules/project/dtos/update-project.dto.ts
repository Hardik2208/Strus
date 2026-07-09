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

  estimatedBudget: z.number().positive().optional(),

  estimatedDuration: z.number().int().positive().optional(),

  expectedStartDate: z.coerce.date().optional(),

  expectedCompletionDate: z.coerce.date().optional(),
});

export type UpdateProjectDto = z.infer<
  typeof updateProjectSchema
>;