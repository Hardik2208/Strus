import { EventType } from "../../../generated/prisma/enums.js";

export interface EventJobDto {
  type: EventType;

  actorId: string;

  workspaceId?: string;

  projectId?: string;

  agreementId?: string;

  executionId?: string;

  paymentId?: string;
}