/**
 * Event Module Shared Types
 */

/**
 * Composite cursor for stable pagination.
 */
export interface EventCursor {
  createdAt: Date;
  eventId: string;
}

/**
 * Cursor-based pagination options.
 */
export interface EventPaginationOptions {
  cursor?: EventCursor;
  limit: number;
}

/**
 * Generic cursor pagination response.
 */
export interface EventPaginationResult<T> {
  data: T[];
  nextCursor: EventCursor | null;
  hasMore: boolean;
}

/**
 * Dashboard activity query filters.
 */
export interface DashboardActivityFilters {
  userId: string;
  cursor?: EventCursor;
  limit: number;
}