import type {
  DisputeOrigin,
  DisputeStatus,
} from "../../../generated/prisma/enums.js";

// ==================================================
// Dispute Response
// ==================================================

export interface DisputeResponse {

  id: string;

  milestoneId: string;

  createdById: string;

  origin: DisputeOrigin;

  status: DisputeStatus;

  reason: string;

  requestedResolution: string | null;

  holdStartedAt: Date | null;

  holdDurationSeconds: number;

  negotiationCount: number;

  resolvedAt: Date | null;

  closedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

}