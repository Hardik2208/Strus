export type WorkspaceType = 'PERSONAL' | 'TEAM';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  workspaceType: WorkspaceType;
  role: WorkspaceRole;
}

export interface WorkspaceListResponse {
  workspaces: WorkspaceSummary[];
  pagination: PaginationMeta;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  workspaceType: WorkspaceType;
  myRole: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceMembersResponse {
  members: WorkspaceMember[];
  pagination: PaginationMeta;
}

export interface WorkspaceInvitation {
  id: string;
  invitedUserId: string;
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  invitedBy?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  expiresAt: string;
  createdAt: string;
}

export interface WorkspaceInvitationsResponse {
  invitations: WorkspaceInvitation[];
  pagination: PaginationMeta;
}

export interface WorkspaceAuditLog {
  id: string;
  action: string;
  actor: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface WorkspaceAuditResponse {
  logs: WorkspaceAuditLog[];
  pagination: PaginationMeta;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  identifier: string; // username or email
}

export interface TransferOwnershipRequest {
  newOwnerId: string;
}

export interface UpdateMemberRoleRequest {
  role: 'ADMIN' | 'MEMBER';
}

export interface PendingWorkspaceInvitation {
  id: string;
  status: 'PENDING';
  expiresAt: string;
  createdAt: string;

  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    workspaceType: WorkspaceType;
    owner: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };

  invitedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}