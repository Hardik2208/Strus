import type {
  DashboardAttentionItem,
} from "./dashboard-attention.type.js";

import type {
  DashboardActivityItem,
} from "./dashboard-activity.type.js";

export interface ClientDashboardOverview {
  totalWorkspaces: number;

  totalProjects: number;

  activeProjects: number;

  draftProjects: number;

  completedProjects: number;

  requiresAttentionCount: number;
}

export interface ClientWorkspaceSummary {
  id: string;

  name: string;

  slug: string;

  workspaceType: string;

  updatedAt: Date;

  memberCount: number;

  totalProjects: number;

  activeProjects: number;

  draftProjects: number;

  completedProjects: number;

  executionProgress: number | null;
}

export interface ClientDashboardResponse {
  overview: ClientDashboardOverview;

  workspaces: ClientWorkspaceSummary[];

  requiresAttention:
    DashboardAttentionItem[];

  recentActivity:
    DashboardActivityItem[];
}