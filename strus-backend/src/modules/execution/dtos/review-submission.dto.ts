import { z } from "zod";

export const approveSubmissionSchema =
  z.object({
    content: z
      .string()
      .trim()
      .max(5000)
      .optional(),
  });

export const requestRevisionSchema =
  z.object({
    content: z
      .string()
      .trim()
      .min(
        1,
        "Revision requirements are required."
      )
      .max(10000),
  });

export type ApproveSubmissionDto =
  z.infer<
    typeof approveSubmissionSchema
  >;

export type RequestRevisionDto =
  z.infer<
    typeof requestRevisionSchema
  >;