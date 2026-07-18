export interface DashboardActivityItem {
  id: string;

  source:
    | "PROJECT"
    | "AGREEMENT";

  action: string;

  title: string;

  description: string;

  projectId: string;

  projectTitle: string;

  createdAt: Date;
}