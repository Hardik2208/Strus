export interface ProfessionalDashboardOverview {
  totalProjects: number;

  activeProjects: number;

  completedProjects: number;

  draftProjects: number;
}

export interface ActiveProjectSummary {
  id: string;

  name: string;

  workspaceId: string;

  workspaceName: string;

  clientId: string;

  clientName: string;

  currentMilestoneId: string | null;

  currentMilestoneName: string | null;

  progress: number;

  status: string;
}

export interface ProfessionalDashboardActivity {
  id: string;

  source: "PROJECT" | "AGREEMENT";

  action: string;

  title: string;

  description: string;

  projectId: string;

  projectTitle: string;

  createdAt: Date;
}

export interface ProfessionalQuickAction {
  key: string;

  label: string;

  route: string;
}

export interface ProfessionalDashboardResponse {
  overview: ProfessionalDashboardOverview;

  activeProjects: ActiveProjectSummary[];

  recentActivity: ProfessionalDashboardActivity[];

  quickActions: ProfessionalQuickAction[];
}