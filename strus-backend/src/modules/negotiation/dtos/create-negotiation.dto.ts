import type { Prisma } from "../../../generated/prisma/client.js";

export interface CreateNegotiationDto {

  proposedPercentage: number;

  proposedAmount?: Prisma.Decimal | null;

  reason: string;

}