export interface AppEvent {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
}

export interface EventPagination {
  nextCursor: string | null;
  hasNext: boolean;
  total?: number;
}

export interface EventListResponse {
  data: AppEvent[];
  pagination: EventPagination;
}

export interface UnreadCountResponse {
  count: number;
}

// Common event types (these should map to the backend's emitted event types)
export const EVENT_TYPES = {
  // Execution
  EXECUTION_PLAN_CREATED: 'EXECUTION_PLAN_CREATED',
  EXECUTION_PLAN_UPDATED: 'EXECUTION_PLAN_UPDATED',
  PROJECT_ASSET_SHARED: 'PROJECT_ASSET_SHARED',
  SUBMISSION_CREATED: 'SUBMISSION_CREATED',
  SUBMISSION_APPROVED: 'SUBMISSION_APPROVED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
  MILESTONE_COMPLETED: 'MILESTONE_COMPLETED',
  MILESTONE_STARTED: 'MILESTONE_STARTED',
  EXTENSION_REQUEST_CREATED: 'EXTENSION_REQUEST_CREATED',
  EXTENSION_GRANTED: 'EXTENSION_GRANTED',
  EXTENSION_REJECTED: 'EXTENSION_REJECTED',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED',
  
  // Agreement
  AGREEMENT_CREATED: 'AGREEMENT_CREATED',
  AGREEMENT_UPDATED: 'AGREEMENT_UPDATED',
  AGREEMENT_INVITATION_CREATED: 'AGREEMENT_INVITATION_CREATED',
  
  // Negotiation
  NEGOTIATION_CREATED: 'NEGOTIATION_CREATED',
  NEGOTIATION_ACCEPTED: 'NEGOTIATION_ACCEPTED',
  NEGOTIATION_DECLINED: 'NEGOTIATION_DECLINED',
  
  // Dispute
  DISPUTE_CREATED: 'DISPUTE_CREATED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];
