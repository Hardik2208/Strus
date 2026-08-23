import { z } from "zod";

export const createDisputeSchema = z.object({

  milestoneId: z
    .string()
    .uuid(),

  reason: z
    .string()
    .trim()
    .min(10)
    .max(2000),

  requestedResolution: z
    .string()
    .trim()
    .max(2000)
    .optional(),

});

export type CreateDisputeDto = z.infer<
  typeof createDisputeSchema
>;