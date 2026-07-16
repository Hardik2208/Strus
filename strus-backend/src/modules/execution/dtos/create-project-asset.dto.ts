import { z } from "zod";

export const createProjectAssetSchema = z.object({
  visibleToParticipants: z
    .preprocess(
      (value) => {
        if (Array.isArray(value)) {
          return value;
        }

        if (typeof value === "string") {
          return [value];
        }

        return value;
      },
      z.array(z.uuid()).min(
        1,
        "Select at least one professional."
      )
    ),
});

export type CreateProjectAssetDto =
  z.infer<typeof createProjectAssetSchema>;