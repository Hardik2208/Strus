import { z } from "zod";

import { AgreementInvitationStatus } from "../../../generated/prisma/enums.js";

export const updateInvitationStatusSchema =
  z.object({
    status: z.enum([
      AgreementInvitationStatus.ACCEPTED,
      AgreementInvitationStatus.DECLINED,
      AgreementInvitationStatus.WITHDRAWN,
    ]),
  });

export type UpdateInvitationStatusDto =
  z.infer<
    typeof updateInvitationStatusSchema
  >;