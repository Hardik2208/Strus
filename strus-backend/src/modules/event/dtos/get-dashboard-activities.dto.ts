import { z } from "zod";

export const GetDashboardActivitiesSchema =
  z.object({
    cursor: z
      .uuid()
      .optional(),

    limit: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),
  });

export type GetDashboardActivitiesDto =
  z.infer<
    typeof GetDashboardActivitiesSchema
  >;