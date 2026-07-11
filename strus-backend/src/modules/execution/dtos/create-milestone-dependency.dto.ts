import { z } from "zod";

export const createMilestoneDependencySchema =
  z.object({
    milestoneId: z.uuid(),

    dependsOnMilestoneId: z.uuid(),
  });

export type CreateMilestoneDependencyDto =
  z.infer<
    typeof createMilestoneDependencySchema
  >;