import { z } from "zod";

export const createAgreementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(150),

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

  budget: z
    .coerce
    .number()
    .positive(),

  expectedDuration: z
    .coerce
    .number()
    .int()
    .positive(),
});

export type CreateAgreementDto = z.infer<
  typeof createAgreementSchema
>;