import { z } from "zod";

export const createMilestoneExtensionSchema =
  z.object({
    milestoneId: z.uuid(),

    daysAdded: z
      .coerce
      .number()
      .int()
      .positive(),

    reason: z
      .string()
      .trim()
      .min(10)
      .max(5000),
  });

export type CreateMilestoneExtensionDto =
  z.infer<
    typeof createMilestoneExtensionSchema
  >;