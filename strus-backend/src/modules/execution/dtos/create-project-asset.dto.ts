import { z } from "zod";

export const createProjectAssetSchema =
  z.object({
    visibleToParticipants: z
      .array(z.uuid())
      .min(
        1,
        "Select at least one professional."
      ),
  });

export type CreateProjectAssetDto =
  z.infer<
    typeof createProjectAssetSchema
  >;