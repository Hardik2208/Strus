import {
  ProjectStatus,
  ProjectSetupStage,
} from "../../../generated/prisma/enums.js";

export interface ProjectResponse {
  id: string;

  workspaceId: string;

  createdById: string;

  title: string;

  description: string | null;

  status: ProjectStatus;

  setupStage: ProjectSetupStage;

  createdAt: Date;

  updatedAt: Date;
}