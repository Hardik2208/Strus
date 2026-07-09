import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
  .string()
  .trim()
  .min(3)
  .max(120),

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

export type CreateProjectDto = z.infer<
  typeof createProjectSchema
>;