import { z } from "zod";

export const GetClientDashboardDtoSchema =
  z.object({
    activityLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(10),
  });

export type GetClientDashboardDto =
  z.infer<
    typeof GetClientDashboardDtoSchema
  >;