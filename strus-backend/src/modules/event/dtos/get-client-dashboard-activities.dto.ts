import { z } from "zod";

export const GetClientDashboardActivitiesSchema =
  z.object({
    cursor: z
      .object({
        createdAt: z.coerce.date(),
        eventId: z.uuid(),
      })
      .optional(),

    limit: z
      .coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),
  });

export type GetClientDashboardActivitiesDto =
  z.infer<
    typeof GetClientDashboardActivitiesSchema
  >;