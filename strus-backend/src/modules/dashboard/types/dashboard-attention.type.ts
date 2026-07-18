export interface DashboardAttentionItem {
  id: string;

  type:
    | "AGREEMENT_SIGNATURE";

  title: string;

  description: string;

  projectId: string;

  projectTitle: string;

  createdAt: Date;
}