import type {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

export interface EventCreatedByResponse {
  id: string;

  firstName: string;

  lastName: string;

  avatarUrl: string | null;
}

export interface EventResponse {
  id: string;

  type: EventType;

  audience: EventAudience;

  resourceType: EventResourceType;

  resourceId: string;

  title: string;

  description: string;

  metadata: unknown;

  createdAt: Date;

  createdBy: EventCreatedByResponse;
}

export interface DashboardActivitiesNextCursor {
  createdAt: Date;

  eventId: string;
}

export interface DashboardActivityResponse {
  activities: EventResponse[];

  nextCursor: DashboardActivitiesNextCursor | null;

  hasMore: boolean;
}