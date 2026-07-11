import { z } from "zod";

const checklistItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1)
    .max(5000),
});

const deliverableSchema = checklistItemSchema.extend({
  isMandatory: z
    .boolean()
    .default(true),
});

export const createMilestoneSchema = z.object({

  allocatedDays: z.coerce
    .number()
    .int()
    .positive(),

  paymentAllocation: z.coerce
    .number()
    .positive(),

  revisionLimit: z.coerce
    .number()
    .int()
    .min(0),

  dependencies: z
    .array(
      z.coerce.number().int().positive()
    )
    .default([]),

  requirements: z
    .array(checklistItemSchema)
    .default([]),

  deliverables: z
    .array(deliverableSchema)
    .default([]),

  acceptanceCriteria: z
    .array(checklistItemSchema)
    .default([]),
});

export type CreateMilestoneDto = z.infer<
  typeof createMilestoneSchema
>;