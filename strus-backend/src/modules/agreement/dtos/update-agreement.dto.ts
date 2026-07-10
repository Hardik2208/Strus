import { z } from "zod";

export const updateAgreementSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000)
      .optional(),

    scope: z
      .string()
      .trim()
      .max(10000)
      .optional(),

    outOfScope: z
      .string()
      .trim()
      .max(10000)
      .optional(),

    budget: z.coerce
      .number()
      .positive()
      .optional(),

    expectedDuration: z.coerce
      .number()
      .int()
      .positive()
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one field must be provided.",
    }
  );

export type UpdateAgreementDto = z.infer<
  typeof updateAgreementSchema
>;