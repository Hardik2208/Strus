import type {
  Dispute,
} from "../../../generated/prisma/client.js";

import type {
  DisputeResponse,
} from "../interfaces/dispute-response.interface.js";

export class DisputeMapper {

  // ==================================================
  // Dispute Response
  // ==================================================

  static toDisputeResponse(
    dispute: Dispute
  ): DisputeResponse {

    return {

      id:
        dispute.id,

      milestoneId:
        dispute.milestoneId,

      createdById:
        dispute.createdById,

      origin:
        dispute.origin,

      status:
        dispute.status,

      reason:
        dispute.reason,

      requestedResolution:
        dispute.requestedResolution,

      holdStartedAt:
        dispute.holdStartedAt,

      holdDurationSeconds:
        dispute.holdDurationSeconds,

      negotiationCount:
        dispute.negotiationCount,

      resolvedAt:
        dispute.resolvedAt,

      closedAt:
        dispute.closedAt,

      createdAt:
        dispute.createdAt,

      updatedAt:
        dispute.updatedAt,

    };

  }

  // ==================================================
  // Dispute Response List
  // ==================================================

  static toDisputeResponseList(
    disputes: Dispute[]
  ): DisputeResponse[] {

    return disputes.map(
      dispute =>
        this.toDisputeResponse(
          dispute
        )
    );

  }

}