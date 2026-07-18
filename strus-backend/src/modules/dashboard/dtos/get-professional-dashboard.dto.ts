import { z } from "zod";

export const GetProfessionalDashboardDtoSchema =
  z.object({
    activityLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(20)
      .default(10),
  });

export type GetProfessionalDashboardDto =
  z.infer<
    typeof GetProfessionalDashboardDtoSchema
  >;