import { z } from "zod";

export const updateProjectAssetSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    isPublic: z
      .boolean()
      .optional(),

    visibleToParticipantIds: z
      .array(z.uuid())
      .optional(),
  });

export type UpdateProjectAssetDto = z.infer<
  typeof updateProjectAssetSchema
>;