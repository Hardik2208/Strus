import { LayoutDashboard, Settings, Briefcase, Activity, Building2, Zap, Search } from 'lucide-react';
import type { NavigationConfig, SidebarNavigationItem } from './navigation.types';

const clientNavigation: SidebarNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard/client', section: 'WORKSPACE' },
  { id: 'activities', label: 'Recent Activity', icon: Activity, route: '/dashboard/client/activities', section: 'WORKSPACE' },
  { id: 'workspaces', label: 'Workspaces', icon: Building2, route: '/workspaces', section: 'WORKSPACE' },
  { id: 'quick-actions', label: 'Quick Actions', icon: Zap, route: '/dashboard/client#quick-actions', section: 'QUICK_ACTIONS' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/client/settings', section: 'ACCOUNT' },
];

const professionalNavigation: SidebarNavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard/professional', section: 'WORKSPACE' },
  { id: 'projects', label: 'My Projects', icon: Briefcase, route: '/dashboard/professional/projects', section: 'WORKSPACE' },
  { id: 'scout', label: 'Scout Projects', icon: Search, route: '/dashboard/professional/scout', section: 'WORKSPACE' },
  { id: 'activities', label: 'Recent Activity', icon: Activity, route: '/dashboard/professional/activities', section: 'WORKSPACE' },
  { id: 'quick-actions', label: 'Quick Actions', icon: Zap, route: '/dashboard/professional#quick-actions', section: 'QUICK_ACTIONS' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/dashboard/professional/settings', section: 'ACCOUNT' },
];

export const navigationConfig: NavigationConfig = {
  shared: [], // Retained for type compatibility if needed, but unused
  client: clientNavigation,
  professional: professionalNavigation,
};
