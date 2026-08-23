import type {
  NegotiationStatus,
  PartyResponseStatus,
  SettlementProposal,
} from "../../../generated/prisma/enums.js";

import type {
  NegotiationResponse,
} from "../interfaces/negotiation-response.interface.js";

import type { Prisma } from "../../../generated/prisma/client.js";

// ==================================================
// Create Negotiation
// ==================================================


export interface CreateNegotiationInput {

  projectId: string;

  milestoneId: string;

  negotiationNumber: number;

  initiatedById: string;

  proposedPercentage: number;

  proposedAmount?: Prisma.Decimal | null;

  reason: string;

  status: NegotiationStatus;

  waitingStatus: PartyResponseStatus;

  responseDeadline: Date;

}

// ==================================================
// Update Negotiation
// ==================================================

export interface UpdateNegotiationInput {

  proposedPercentage?: number | null;

  proposedAmount?: Prisma.Decimal | null;

  reason?: string;

  status?: NegotiationStatus;

  waitingStatus?: PartyResponseStatus;

  respondedAt?: Date | null;

}

// ==================================================
// Respond To Negotiation
// ==================================================

export interface RespondNegotiationInput {

  negotiationId: string;

  userId: string;

}

// ==================================================
// Respond To Continuation
// ==================================================

export interface CreateNegotiationRequest {

  milestoneId: string;

  userId: string;

  proposedPercentage: number;

  proposedAmount?: Prisma.Decimal | null;

  reason: string;

}

// ==================================================
// Create Negotiation Result
// ==================================================

export interface CreateNegotiationResult {

  response: NegotiationResponse;

  socket: {

    recipientUserId: string;

    negotiationId: string;

    projectId: string;

    milestoneId: string;

    responseDeadline: Date;

    status: NegotiationStatus;

  };

}