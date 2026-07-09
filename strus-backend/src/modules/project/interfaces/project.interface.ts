import type {
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

export interface ProjectResponse {
  id: string;

  workspaceId: string;

  createdById: string;

  title: string;

  description: string | null;

  status: ProjectStatus;

  estimatedBudget: number | null;

  estimatedDuration: number | null;

  expectedStartDate: Date | null;

  expectedCompletionDate: Date | null;

  createdAt: Date;

  updatedAt: Date;
}