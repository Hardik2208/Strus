import type {
  WorkspaceRole,
  WorkspaceType,
} from "../../../generated/prisma/enums.js";

export interface WorkspaceResponse {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  workspaceType: WorkspaceType;

  myRole: WorkspaceRole;

  createdAt: Date;

  updatedAt: Date;
}