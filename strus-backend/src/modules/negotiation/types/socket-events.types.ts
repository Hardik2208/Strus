import type {
  NegotiationStatus,
} from "../../../generated/prisma/enums.js";

export interface NegotiationActionRequestCreatedEvent {

  negotiationId: string;

  projectId: string;

  milestoneId: string;

  responseDeadline: Date;

  status: NegotiationStatus;

}

export interface NegotiationAcceptedEvent {

  negotiationId: string;

  projectId: string;

  milestoneId: string;

}

export interface NegotiationDeclinedEvent {

  negotiationId: string;

  projectId: string;

  milestoneId: string;

}

export interface NegotiationExpiredEvent {

  negotiationId: string;

  projectId: string;

  milestoneId: string;

}