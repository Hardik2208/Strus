import type { AppEvent } from '../types/event.types';

/**
 * Resolves an event's resourceType and resourceId into an application route.
 * Returns null if the event is informational only.
 */
export function getEventDestination(event: AppEvent): string | null {
  if (!event.resourceType || !event.resourceId) {
    return null;
  }

  // The actual mapping depends on the routing schema of Strus.
  // We use placeholder mappings that fit typical SaaS application routing.
  switch (event.resourceType.toUpperCase()) {
    case 'PROJECT':
      return `/dashboard/projects/${event.resourceId}`;
    
    case 'AGREEMENT':
      return `/dashboard/agreements/${event.resourceId}`;
      
    case 'MILESTONE':
    case 'SUBMISSION':
      return `/dashboard/execution/milestones/${event.resourceId}`;
      
    case 'NEGOTIATION':
      return `/dashboard/negotiations/${event.resourceId}`;
      
    case 'DISPUTE':
      return `/dashboard/disputes/${event.resourceId}`;
      
    default:
      return null;
  }
}
