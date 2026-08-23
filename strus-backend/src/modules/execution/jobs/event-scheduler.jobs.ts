import { prisma } from "../../../core/database/prisma.js";

import { NegotiationService } from "../../negotiation/services/negotiation.service.js";
import { ActionRequestService } from "../../action-request/services/action-request.service.js";

import { NegotiationRepository } from "../../negotiation/repositories/negotiation.repository.js";
import { ActionRequestRepository } from "../../action-request/repositories/action-request.repository.js";

import { SubmissionAutoApprovalJob } from "../../execution/jobs/submission-auto-approval.job.js";

export class EventSchedulerJobs {

  // ==================================================
  // Submission Auto Approval
  // ==================================================

  static async autoApproveSubmissions(): Promise<void> {

    await SubmissionAutoApprovalJob.execute();

  }

  // ==================================================
  // Negotiation Expiry
  // ==================================================

  static async expireNegotiations(): Promise<void> {

    const negotiations =
      await NegotiationRepository.findExpiredNegotiations();

    for (const negotiation of negotiations) {

      await prisma.$transaction(
        async (tx) => {

          await NegotiationService.expireNegotiation(
            tx,
            negotiation.id
          );

        }
      );

    }

  }

  // ==================================================
  // ActionRequest Expiry
  // ==================================================

  static async expireActionRequests(): Promise<void> {

    const actionRequests =
      await ActionRequestRepository.findExpired();

    for (const actionRequest of actionRequests) {

      await ActionRequestService.expire(
        actionRequest.id
      );

    }

  }

}