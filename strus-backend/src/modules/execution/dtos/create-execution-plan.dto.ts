import { z } from "zod";

import {
  createMilestoneSchema,
} from "./create-milestone.dto.js";

const professionalExecutionPlanSchema =
  z.object({
    agreementParticipantId: z.uuid(),

    milestones: z
      .array(createMilestoneSchema)
      .min(1),
  });

export const createExecutionPlanSchema =
  z.object({
    professionals: z
      .array(
        professionalExecutionPlanSchema
      )
      .min(1),
  });

export type ProfessionalExecutionPlanDto =
  z.infer<
    typeof professionalExecutionPlanSchema
  >;

export type CreateExecutionPlanDto =
  z.infer<
    typeof createExecutionPlanSchema
  >;