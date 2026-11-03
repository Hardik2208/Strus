export interface ClientDashboardOverview {
  totalWorkspaces: number;
  totalProjects: number;
  activeProjects: number;
  draftProjects: number;
  completedProjects: number;
  requiresAttentionCount: number;
}

export interface RequiresAttentionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ProfessionalDashboardOverview {
  totalProjects: number;
  activeProjects: number;
  draftProjects: number;
  completedProjects: number;
}

export interface ActiveProject {
  id: string;
  workspaceId: string;
  workspaceName: string;
  clientId: string;
  clientName: string;
  currentMilestoneId: string | null;
  currentMilestoneName: string | null;
  progress: number;
  status: string;
}

export interface QuickAction {
  key: string;
  label: string;
  route: string;
}

export interface PendingInvitation {
  id: string;
  title: string;
  clientName: string;
}