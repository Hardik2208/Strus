import type {
  ActionDecision,
  ActionParticipantStatus,
  ActionRequestStatus,
  ActionRequestType,
} from "../../../generated/prisma/enums.js";

import type { Prisma } from "../../../generated/prisma/client.js";

// ==================================================
// Create Action Request
// ==================================================

export interface CreateActionRequestInput {

  type:
    ActionRequestType;

  deadline:
    Date;

  participantIds:
    [string, string];

  // -----------------------------------------------
  // Domain association
  // -----------------------------------------------

  negotiationId?:
    string;

  disputeResultId?:
    string;
}

// ==================================================
// Respond To Action Request
// ==================================================

export interface RespondActionRequestInput {

  actionRequestId:
    string;

  userId:
    string;

  decision:
    ActionDecision;
}

// ==================================================
// Action Request Response
// ==================================================

export interface ActionRequestParticipantResponse {

  id:
    string;

  userId:
    string;

  decision:
    ActionDecision | null;

  status:
    ActionParticipantStatus;

  respondedAt:
    Date | null;

  createdAt:
    Date;
}

export interface ActionRequestResponse {

  id:
    string;

  type:
    ActionRequestType;

  status:
    ActionRequestStatus;

  deadline:
    Date;

  completedAt:
    Date | null;

  negotiationId:
    string | null;

  disputeResultId:
    string | null;

  createdAt:
    Date;

  updatedAt:
    Date;

  participants:
    ActionRequestParticipantResponse[];
}

// ==================================================
// Create Prisma Input
// ==================================================

export type ActionRequestCreateData =
  Prisma.ActionRequestCreateInput;