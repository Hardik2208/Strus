import type {
  WorkspaceRole,
  WorkspaceType,
} from "../../../generated/prisma/enums.js";

export interface CreateWorkspaceInput {
  ownerId: string;
  name: string;
  slug: string;
  description?: string | null;
  workspaceType: WorkspaceType;
}

export interface CreateWorkspaceMemberInput {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

export interface CreatePersonalWorkspaceInput {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
}