import type {
  DisputeOrigin,
  DisputeStatus,
} from "../../../generated/prisma/enums.js";

import type {
  Prisma,
} from "../../../generated/prisma/client.js";

import type {
  DisputeResponse,
} from "../interfaces/dispute-response.interface.js";

export interface CreateDisputeResult {

  response: DisputeResponse;

  event: {

    disputeId: string;

    projectId: string;

    createdById: string;

  };

}

// ==================================================
// Create Dispute
// ==================================================

export interface CreateDisputeInput {

  milestoneId: string;

  createdById: string;

  origin: DisputeOrigin;

  status: DisputeStatus;

  reason: string;

  requestedResolution?: string | null;

  holdStartedAt: Date;

}

// ==================================================
// Update Dispute
// ==================================================

export interface UpdateDisputeInput {

  status?: DisputeStatus;

  reason?: string;

  requestedResolution?: string | null;

  holdStartedAt?: Date | null;

  resolvedAt?: Date | null;

  closedAt?: Date | null;

}

// ==================================================
// Create Dispute Request
// ==================================================

export interface CreateDisputeRequest {

  milestoneId: string;

  userId: string;

  reason: string;

  requestedResolution?: string | null;

}

// ==================================================
// Get Disputes
// ==================================================

export interface GetDisputesRequest {

  milestoneId: string;

  page: number;

  limit: number;

}