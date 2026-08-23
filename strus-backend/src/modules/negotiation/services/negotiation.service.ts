import { NegotiationRepository } from "../repositories/negotiation.repository.js";
import { NegotiationHelperRepository } from "../repositories/negotiation-helper.repository.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { NegotiationMapper } from "../mappers/negotiation.mapper.js";

import { NegotiationCache } from "../cache/negotiation.cache.js";

import {
  MilestoneStatus,
  NegotiationStatus,
  PartyResponseStatus,
  ExecutionAuditAction,
  SubmissionStatus,
} from "../../../generated/prisma/enums.js";

import { ExecutionAuditRepository } from "../../execution/repositories/execution-audit.repository.js";
import type {
  NegotiationResponse,
} from "../interfaces/negotiation-response.interface.js";

import type {
  NegotiationListResponse,
} from "../interfaces/negotiation-list-response.interface.js";
import type { CreateNegotiationRequest,CreateNegotiationInput, CreateNegotiationResult } from "../types/create-negotiation.types.js";

import {
  ActionRequestService,
} from "../../action-request/services/action-request.service.js";

import {
  ActionRequestType,
} from "../../../generated/prisma/enums.js";

export class NegotiationService {

  // ==================================================
  // Get Negotiation
  // ==================================================

  static async getNegotiation(
    negotiationId: string
  ): Promise<NegotiationResponse> {

    // ================================================
    // Cache
    // ================================================

    const cached =
      await NegotiationCache.getNegotiation(
        negotiationId
      );

    if (cached) {
      return cached;
    }

    // ================================================
    // Repository
    // ================================================

    const negotiation =
      await NegotiationRepository.findDetails(
        negotiationId
      );

    if (!negotiation) {
      throw new Error(
        "Negotiation not found."
      );
    }

    // ================================================
    // Response
    // ================================================

    const response =
      NegotiationMapper.toNegotiationResponse(
        negotiation
      );

    // ================================================
    // Cache
    // ================================================

    await NegotiationCache.setNegotiation(
      negotiationId,
      response
    );

    return response;

  }

  // ==================================================
  // Get Milestone Negotiations
  // ==================================================

  static async getNegotiations(
    milestoneId: string,
    page: number,
    limit: number
  ): Promise<NegotiationListResponse> {

    // ================================================
    // Validate Milestone
    // ================================================

    const milestone =
      await NegotiationHelperRepository.findMilestone(
        milestoneId
      );

    if (!milestone) {
      throw new Error(
        "Milestone not found."
      );
    }

    // ================================================
    // Cache
    // ================================================

    const cached =
      await NegotiationCache.get(
        milestoneId,
        page,
        limit
      );

    if (cached) {
      return cached;
    }

    // ================================================
    // Repository
    // ================================================

    const {
      negotiations,
      total,
    } =
      await NegotiationRepository.findByMilestone(
        milestoneId,
        page,
        limit
      );

    // ================================================
    // Response
    // ================================================

    const response: NegotiationListResponse = {

      negotiations:
        NegotiationMapper.toNegotiationResponseList(
          negotiations
        ),

      pagination: {

        page,

        limit,

        totalItems:
          total,

        totalPages:
          Math.ceil(
            total / limit
          ),

        hasNextPage:
          page <
          Math.ceil(
            total / limit
          ),

        hasPreviousPage:
          page > 1,

      },

    };

    // ================================================
    // Cache
    // ================================================

    await NegotiationCache.set(
      milestoneId,
      page,
      limit,
      response
    );

    return response;

  }

  // ==================================================
// Create Negotiation
// ==================================================

static async createNegotiation(
  tx: Prisma.TransactionClient,
  request: CreateNegotiationRequest
): Promise<CreateNegotiationResult>{

  // ================================================
  // Validate Percentage
  // ================================================

  if (
    request.proposedPercentage < 0 ||
    request.proposedPercentage > 100
  ) {
    throw new Error(
      "Payment percentage must be between 0 and 100."
    );
  }

  // ================================================
// Validate Payment Amount
// ================================================
if (
  request.proposedPercentage === 0 &&
  request.proposedAmount != null
) {
    throw new Error(
        "No payment negotiation cannot contain amount."
    );
}

if (
    request.proposedPercentage > 0 &&
    request.proposedAmount == null
) {
    throw new Error(
        "Payment amount is required."
    );
}


  // ================================================
  // Load Milestone
  // ================================================

  const milestone =
    await NegotiationHelperRepository.findMilestoneForNegotiation(
      request.milestoneId
    );

  if (!milestone) {
    throw new Error(
      "Milestone not found."
    );
  }

  // ================================================
  // Validate Client
  // ================================================

  if (
    milestone.project.createdById !==
    request.userId
  ) {
    throw new Error(
      "Only the project client can create a negotiation."
    );
  }

  // ================================================
  // Validate Milestone Status
  // ================================================

  if (
  milestone.status !==
  MilestoneStatus.REVISION_LIMIT_REACHED
) {
  throw new Error(
    "Negotiation can only be created after the revision limit has been reached."
  );
}

  // ================================================
  // Latest Submission
  // ================================================

  const latestSubmission =
    await NegotiationHelperRepository.findLatestSubmission(
      request.milestoneId
    );

  if (!latestSubmission) {
    throw new Error(
      "No submission exists for this milestone."
    );
  }

  if (
  latestSubmission.status !==
  SubmissionStatus.REJECTED
) {
  throw new Error(
    "Negotiation cannot be created for this submission."
  );
}

  // ================================================
// Pending Negotiation
// ================================================

const pendingNegotiation =
  await NegotiationRepository.findPendingByMilestone(
    request.milestoneId
  );

if (pendingNegotiation) {
  throw new Error(
    "A negotiation is already pending for this milestone."
  );
}

  // ================================================
  // Previous Negotiation
  // ================================================

  const latestNegotiation =
    await NegotiationRepository.findLatestByMilestone(
      request.milestoneId
    );

  if (
    latestNegotiation &&
    latestNegotiation.negotiationNumber >= 2
  ) {
    throw new Error(
      "Maximum negotiation limit reached."
    );
  }

  // ================================================
  // Negotiation Number
  // ================================================

  const negotiationNumber =
    latestNegotiation
      ? latestNegotiation.negotiationNumber + 1
      : 1;

  // ================================================
  // Response Deadline
  // ================================================

  const responseDeadline =
    new Date();

  responseDeadline.setDate(
    responseDeadline.getDate() + 7
  );

  // ================================================
// Repository Input
// ================================================

const input: CreateNegotiationInput = {

  projectId:
    milestone.project.id,

  milestoneId:
    milestone.id,

  negotiationNumber,

  initiatedById:
    request.userId,

  proposedPercentage:
    request.proposedPercentage,

  proposedAmount:
    request.proposedAmount,

  reason:
    request.reason,

  status:
    NegotiationStatus.PENDING,

  waitingStatus:
    PartyResponseStatus.WAITING_FOR_PROFESSIONAL,

  responseDeadline,

};

const negotiation =
  await (async () => {

    // ============================================
    // Create Negotiation
    // ============================================

    const createdNegotiation =
      await NegotiationRepository.create(
        tx,
        input
      );

    // ============================================
    // Update Milestone
    // ============================================

    await NegotiationHelperRepository.updateMilestoneStatus(
      tx,
      request.milestoneId,
      MilestoneStatus.NEGOTIATION
    );

    // ============================================
    // Execution Audit
    // ============================================

    await ExecutionAuditRepository.create(
      tx,
      {
        action:
          ExecutionAuditAction.NEGOTIATION_CREATED,

        project: {
          connect: {
            id: milestone.project.id,
          },
        },

        milestone: {
          connect: {
            id: milestone.id,
          },
        },

        actor: {
          connect: {
            id: request.userId,
          },
        },

        metadata: {

          negotiationId:
            createdNegotiation.id,

          negotiationNumber:
            createdNegotiation.negotiationNumber,

          proposedSettlement:
            createdNegotiation.proposedSettlement,

          proposedPercentage:
            createdNegotiation.proposedPercentage,

          proposedAmount:
            createdNegotiation.proposedAmount?.toString() ?? null,

        },

      }
    );

    return createdNegotiation;

  })();

return {

  response:
    NegotiationMapper.toNegotiationResponse(
      negotiation
    ),

  socket: {

    recipientUserId:
      milestone.agreementParticipant.userId,

    negotiationId:
      negotiation.id,

    projectId:
      negotiation.projectId,

    milestoneId:
      negotiation.milestoneId,

    responseDeadline:
      negotiation.responseDeadline,

    status:
      negotiation.status,

  },

};
}

// ==================================================
// Accept Negotiation
// ==================================================

static async acceptNegotiation(
  tx: Prisma.TransactionClient,
  negotiationId: string,
  userId: string
): Promise<NegotiationResponse> {

  // ================================================
  // Load Negotiation
  // ================================================

  const negotiation =
    await NegotiationHelperRepository.findNegotiationForResponse(
      negotiationId
    );

  if (!negotiation) {

    throw new Error(
      "Negotiation not found."
    );

  }

  // ================================================
  // Validate Status
  // ================================================

  if (
    negotiation.status !==
    NegotiationStatus.PENDING
  ) {

    throw new Error(
      "Negotiation is no longer pending."
    );

  }

  // ================================================
  // Validate Professional
  // ================================================

  if (
    negotiation.milestone
      .agreementParticipant.userId !==
    userId
  ) {

    throw new Error(
      "Only the assigned professional can accept the negotiation."
    );

  }

  // ================================================
  // Validate Deadline
  // ================================================

  if (
    new Date() >
    negotiation.responseDeadline
  ) {

    throw new Error(
      "Negotiation has expired."
    );

  }

  // ================================================
  // Accept + Action Request + Audit
  // ================================================

  const updatedNegotiation =
    await (async () => {

      // ============================================
      // Accept Negotiation
      // ============================================

      const acceptedNegotiation =
        await NegotiationRepository.accept(
          tx,
          negotiationId
        );

      // ============================================
      // Continuation Deadline
      // ============================================

      const deadline =
        new Date();

      deadline.setDate(
        deadline.getDate() + 7
      );

      // ============================================
      // Create Generic Action Request
      // ============================================

      const actionRequest =
        await ActionRequestService.create(
          tx,
          {

            type:
              ActionRequestType
                .NEGOTIATION_CONTINUATION,

            negotiationId:
              acceptedNegotiation.id,

            deadline,

            participantIds: [

              negotiation.project.createdById,

              negotiation.milestone
                .agreementParticipant.userId,

            ],

          }
        );

      // ============================================
      // Audit
      // ============================================

      await ExecutionAuditRepository.create(
        tx,
        {

          action:
            ExecutionAuditAction.NEGOTIATION_ACCEPTED,

          project: {
            connect: {
              id:
                negotiation.project.id,
            },
          },

          milestone: {
            connect: {
              id:
                negotiation.milestone.id,
            },
          },

          actor: {
            connect: {
              id:
                userId,
            },
          },

          metadata: {

            negotiationId:
              acceptedNegotiation.id,

            negotiationNumber:
              acceptedNegotiation
                .negotiationNumber,

            actionRequestId:
              actionRequest.id,

            milestoneId:
              negotiation.milestone.id,

            projectId:
              negotiation.project.id,

            actionRequestDeadline:
              actionRequest.deadline,

          },

        }
      );

      return acceptedNegotiation;

    })();

  // ================================================
  // Response
  // ================================================

  return NegotiationMapper.toNegotiationResponse(
    updatedNegotiation
  );

}

// ==================================================
// Decline Negotiation
// ==================================================

static async declineNegotiation(
  tx: Prisma.TransactionClient,
  negotiationId: string,
  userId: string
): Promise<NegotiationResponse>{

  // ================================================
  // Load Negotiation
  // ================================================

  const negotiation =
    await NegotiationHelperRepository.findNegotiationForResponse(
      negotiationId
    );

  if (!negotiation) {
    throw new Error(
      "Negotiation not found."
    );
  }

  // ================================================
  // Validate Status
  // ================================================

  if (
    negotiation.status !==
    NegotiationStatus.PENDING
  ) {
    throw new Error(
      "Negotiation is no longer pending."
    );
  }

  // ================================================
  // Validate Professional
  // ================================================

  if (
    negotiation.milestone
      .agreementParticipant.userId !==
    userId
  ) {
    throw new Error(
      "Only the assigned professional can decline the negotiation."
    );
  }

  // ================================================
  // Validate Deadline
  // ================================================

  if (
    new Date() >
    negotiation.responseDeadline
  ) {
    throw new Error(
      "Negotiation has expired."
    );
  }

  // ================================================
  // Transaction
  // ================================================

const declinedNegotiation =
  await NegotiationRepository.decline(
    tx,
    negotiationId
  );

// ================================================
// Update Milestone
// ================================================

await NegotiationHelperRepository.updateMilestoneStatus(
  tx,
  negotiation.milestone.id,
  MilestoneStatus.UNDER_DISPUTE
);

// ================================================
// Execution Audit
// ================================================

await ExecutionAuditRepository.create(
  tx,
  {

    action:
      ExecutionAuditAction.NEGOTIATION_DECLINED,

    project: {
      connect: {
        id: negotiation.project.id,
      },
    },

    milestone: {
      connect: {
        id: negotiation.milestone.id,
      },
    },

    actor: {
      connect: {
        id: userId,
      },
    },

    metadata: {

      negotiationId:
        declinedNegotiation.id,

      negotiationNumber:
        declinedNegotiation.negotiationNumber,

      milestoneId:
        negotiation.milestone.id,

      projectId:
        negotiation.project.id,

    },

  }
);

// ================================================
// Response
// ================================================

return NegotiationMapper.toNegotiationResponse(
  declinedNegotiation
);

}

// ==================================================
// Expire Negotiation
// ==================================================
// ==================================================
// Expire Negotiation
// ==================================================

static async expireNegotiation(
  tx: Prisma.TransactionClient,
  negotiationId: string
): Promise<NegotiationResponse | null> {

  // ================================================
  // Load Negotiation
  // ================================================

  const negotiation =
    await NegotiationHelperRepository.findNegotiationForResponse(
      negotiationId
    );

  if (!negotiation) {
    return null;
  }

  // ================================================
  // Validate Status
  // ================================================

  if (
    negotiation.status !==
    NegotiationStatus.PENDING
  ) {
    return null;
  }

  // ================================================
  // Validate Deadline
  // ================================================

  if (
    new Date() <
    negotiation.responseDeadline
  ) {
    return null;
  }

  // ================================================
  // Expire Negotiation
  // ================================================

  const expiredNegotiation =
    await NegotiationRepository.expire(
      tx,
      negotiationId
    );

  // ================================================
  // Update Milestone
  // ================================================

  await NegotiationHelperRepository.updateMilestoneStatus(
    tx,
    negotiation.milestone.id,
    MilestoneStatus.UNDER_DISPUTE
  );

  // ================================================
  // Execution Audit
  // ================================================

  await ExecutionAuditRepository.create(
    tx,
    {

      action:
        ExecutionAuditAction.NEGOTIATION_EXPIRED,

      project: {
        connect: {
          id:
            negotiation.project.id,
        },
      },

      milestone: {
        connect: {
          id:
            negotiation.milestone.id,
        },
      },

      metadata: {

        negotiationId:
          expiredNegotiation.id,

        negotiationNumber:
          expiredNegotiation.negotiationNumber,

        milestoneId:
          negotiation.milestone.id,

        projectId:
          negotiation.project.id,

      },

    }
  );

  // ================================================
  // Response
  // ================================================

  return NegotiationMapper.toNegotiationResponse(
    expiredNegotiation
  );

}
}