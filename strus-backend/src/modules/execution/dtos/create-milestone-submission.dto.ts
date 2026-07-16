import { z } from "zod";

export const createMilestoneSubmissionSchema =
  z.object({
    content: z
      .string()
      .trim()
      .max(10000)
      .optional(),
  });

export type CreateMilestoneSubmissionDto =
  z.infer<
    typeof createMilestoneSubmissionSchema
  >;