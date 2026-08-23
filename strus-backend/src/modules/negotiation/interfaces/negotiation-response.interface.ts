import type {
  NegotiationStatus,
  PartyResponseStatus,
  SettlementProposal,
} from "../../../generated/prisma/enums.js";

// ==================================================
// Negotiation Response
// ==================================================

export interface NegotiationResponse {

  id: string;

  projectId: string;

  milestoneId: string;

  negotiationNumber: number;

  initiatedById: string;

  proposedSettlement: SettlementProposal;

  proposedPercentage: number;

  proposedAmount: string | null;

  reason: string;

  status: NegotiationStatus;

  waitingStatus: PartyResponseStatus;

  respondedAt: Date | null;

  responseDeadline: Date;

  createdAt: Date;

  updatedAt: Date;

}

export interface CreateNegotiationResult {

  response: NegotiationResponse;

  recipientUserId: string;

}