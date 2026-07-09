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

  createdAt: Date;

  updatedAt: Date;
}