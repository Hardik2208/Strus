import type {
  Negotiation,
} from "../../../generated/prisma/client.js";

import type {
  NegotiationResponse,
} from "../interfaces/negotiation-response.interface.js";

export class NegotiationMapper {

  // ==================================================
  // Negotiation Response
  // ==================================================

  static toNegotiationResponse(
    negotiation: Negotiation
  ): NegotiationResponse {

    return {

      id:
        negotiation.id,

      projectId:
        negotiation.projectId,

      milestoneId:
        negotiation.milestoneId,

      negotiationNumber:
        negotiation.negotiationNumber,

      initiatedById:
        negotiation.initiatedById,

      proposedSettlement:
        negotiation.proposedSettlement,

      proposedPercentage:
        negotiation.proposedPercentage,

      proposedAmount:
        negotiation.proposedAmount
          ? negotiation.proposedAmount.toString()
          : null,

      reason:
        negotiation.reason,

      status:
        negotiation.status,

      waitingStatus:
        negotiation.waitingStatus,

      respondedAt:
        negotiation.respondedAt,

      responseDeadline:
        negotiation.responseDeadline,

      createdAt:
        negotiation.createdAt,

      updatedAt:
        negotiation.updatedAt,

    };

  }

  // ==================================================
  // Negotiation Response List
  // ==================================================

  static toNegotiationResponseList(
    negotiations: Negotiation[]
  ): NegotiationResponse[] {

    return negotiations.map(
      negotiation =>
        this.toNegotiationResponse(
          negotiation
        )
    );

  }

}