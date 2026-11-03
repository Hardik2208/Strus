import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type {
  WorkspaceListResponse,
  WorkspaceDetail,
  WorkspaceMembersResponse,
  WorkspaceInvitation,
  WorkspaceAuditResponse,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteMemberRequest,
  TransferOwnershipRequest,
  UpdateMemberRoleRequest,
  PendingWorkspaceInvitation,
} from '../types/workspace.types';

export const workspaceService = {
  async listWorkspaces(page = 1, limit = 10): Promise<WorkspaceListResponse> {
    const response = await apiClient.get<any, ApiSuccess<WorkspaceListResponse>>(`/workspaces?page=${page}&limit=${limit}`);
    
    if (response.data && 'workspaces' in response.data && 'pagination' in response.data) {
      const data = response.data as WorkspaceListResponse;
      return {
        ...data,
        workspaces: data.workspaces.map((w: any) => ({
          ...w,
          role: w.role || w.myRole
        }))
      };
    }
    
    // Fallback if the backend is still returning a raw array (legacy)
    let rawWorkspaces = [];
    if (Array.isArray(response.data)) {
      rawWorkspaces = response.data;
    } else if (response.data && Array.isArray((response.data as any).workspaces)) {
      rawWorkspaces = (response.data as any).workspaces;
    }

    const total = rawWorkspaces.length;
    
    // Map myRole from backend to role for frontend compatibility
    const mappedWorkspaces = rawWorkspaces.map((w: any) => ({
      ...w,
      role: w.role || w.myRole
    }));

    return {
      workspaces: mappedWorkspaces,
      pagination: {
        page: 1,
        limit: total > 0 ? total : 10,
        total: total,
        totalPages: 1,
        hasNext: false
      }
    };
  },

  async getWorkspace(workspaceId: string) {
    return apiClient.get<any, ApiSuccess<WorkspaceDetail>>(`/workspaces/${workspaceId}`);
  },

  async createWorkspace(data: CreateWorkspaceRequest) {
    return apiClient.post<any, ApiSuccess<WorkspaceDetail>>('/workspaces', data);
  },

  async updateWorkspace(workspaceId: string, data: UpdateWorkspaceRequest) {
    return apiClient.patch<any, ApiSuccess<WorkspaceDetail>>(`/workspaces/${workspaceId}`, data);
  },

  async deleteWorkspace(workspaceId: string) {
    return apiClient.delete<any, ApiSuccess<void>>(`/workspaces/${workspaceId}`);
  },

  async leaveWorkspace(workspaceId: string) {
    return apiClient.post<any, ApiSuccess<void>>(`/workspaces/${workspaceId}/leave`);
  },

  async transferOwnership(workspaceId: string, data: TransferOwnershipRequest) {
    return apiClient.patch<any, ApiSuccess<void>>(`/workspaces/${workspaceId}/transfer-ownership`, data);
  },

  async getMembers(workspaceId: string, page = 1, limit = 10) {
    return apiClient.get<any, ApiSuccess<WorkspaceMembersResponse>>(`/workspaces/${workspaceId}/members?page=${page}&limit=${limit}`);
  },

  async updateMemberRole(workspaceId: string, memberId: string, data: UpdateMemberRoleRequest) {
    return apiClient.patch<any, ApiSuccess<void>>(`/workspaces/${workspaceId}/members/${memberId}`, data);
  },

  async removeMember(workspaceId: string, memberId: string) {
    return apiClient.delete<any, ApiSuccess<void>>(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  async getInvitations(workspaceId: string, page = 1, limit = 10) {
    return apiClient.get<any, ApiSuccess<any>>(`/workspaces/${workspaceId}/invitations?page=${page}&limit=${limit}`);
  },

  async createInvitation(workspaceId: string, data: InviteMemberRequest) {
    return apiClient.post<any, ApiSuccess<WorkspaceInvitation>>(`/workspaces/${workspaceId}/invitations`, data);
  },

  async cancelInvitation(workspaceId: string, invitationId: string) {
    return apiClient.delete<any, ApiSuccess<void>>(`/workspaces/${workspaceId}/invitations/${invitationId}`);
  },

  // Note: These endpoints are somewhat disconnected from a specific workspace context (global accept/decline)
  async acceptInvitation(invitationId: string) {
    return apiClient.post<any, ApiSuccess<void>>(`/workspaces/invitations/${invitationId}/accept`);
  },

  async declineInvitation(invitationId: string) {
    return apiClient.post<any, ApiSuccess<void>>(`/workspaces/invitations/${invitationId}/decline`);
  },

  async getAuditLogs(workspaceId: string, page = 1, limit = 20) {
    return apiClient.get<any, ApiSuccess<WorkspaceAuditResponse>>(`/workspaces/${workspaceId}/audit?page=${page}&limit=${limit}`);
  },
  async getPendingInvitations() {
  return apiClient.get<
    any,
    ApiSuccess<{
      invitations: PendingWorkspaceInvitation[];
      count: number;
    }>
  >('/workspaces/invitations/pending');
}
};
