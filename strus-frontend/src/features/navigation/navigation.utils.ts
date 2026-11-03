import { navigationConfig } from './navigation.config';
import type { DashboardPerspective, SidebarNavigationItem } from './navigation.types';

export function getNavigation(perspective: DashboardPerspective): SidebarNavigationItem[] {
  // Use strictly the specific configuration for the role/perspective
  const allItems = perspective === 'client' ? navigationConfig.client : navigationConfig.professional;
  
  // Return items directly; assume they are ordered as defined in the config.
  // We can sort them if sections need to be strictly ordered.
  return [...allItems].sort((a, b) => {
    if (a.section === 'WORKSPACE' && b.section === 'ACCOUNT') return -1;
    if (a.section === 'ACCOUNT' && b.section === 'WORKSPACE') return 1;
    return 0;
  });
}

export function isRouteActive(currentPath: string, itemRoute: string): boolean {
  // If the route is exactly a dashboard root, do an exact match only.
  // Otherwise, /dashboard/client/activities would highlight BOTH Dashboard and Activities.
  if (itemRoute === '/dashboard/client') {
    return currentPath === '/dashboard/client';
  }
  
  if (itemRoute === '/dashboard/professional') {
    return currentPath === '/dashboard/professional';
  }
  
  return currentPath === itemRoute || currentPath.startsWith(`${itemRoute}/`);
}
