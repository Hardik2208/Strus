import { z } from "zod";

import { AgreementAuditAction } from "../../../generated/prisma/enums.js";

export const listAgreementAuditsQuerySchema =
  z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    action: z
      .nativeEnum(AgreementAuditAction)
      .optional(),

    order: z
      .enum(["asc", "desc"])
      .default("desc"),
  });

export type ListAgreementAuditsDto =
  z.infer<
    typeof listAgreementAuditsQuerySchema
  >;