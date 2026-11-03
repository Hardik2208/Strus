import type { LucideIcon } from 'lucide-react';

export type DashboardPerspective = "client" | "professional";

export interface SidebarNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  section?: string;
  badge?: number;
}

export interface NavigationConfig {
  shared: SidebarNavigationItem[];
  client: SidebarNavigationItem[];
  professional: SidebarNavigationItem[];
}
