import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { 
  Project, 
  PaginatedProjectResponse, 
  ProjectListParams,
  CreateProjectDTO,
  UpdateProjectDTO,
  PaginatedAuditResponse,
  ProjectStatus
} from '../types/project.types';

export const projectService = {
  getProfessionalProjects: (params?: ProjectListParams) => {
    return apiClient.get<any, ApiSuccess<PaginatedProjectResponse>>(`/project/me`, { params });
  },

  getWorkspaceProjects: (workspaceId: string, params?: ProjectListParams) => {
    return apiClient.get<any, ApiSuccess<PaginatedProjectResponse>>(`/project/workspaces/${workspaceId}/projects`, { params });
  },

  getProject: (projectId: string) => {
    return apiClient.get<any, ApiSuccess<Project>>(`/project/projects/${projectId}`);
  },

  createProject: (workspaceId: string, data: CreateProjectDTO) => {
    return apiClient.post<any, ApiSuccess<Project>>(`/project/workspaces/${workspaceId}/projects`, data);
  },

  updateProject: (projectId: string, data: UpdateProjectDTO) => {
    return apiClient.patch<any, ApiSuccess<Project>>(`/project/projects/${projectId}`, data);
  },

  deleteProject: (projectId: string) => {
    return apiClient.delete<any, ApiSuccess<void>>(`/project/projects/${projectId}`);
  },

  updateProjectStatus: (projectId: string, status: ProjectStatus) => {
    return apiClient.patch<any, ApiSuccess<Project>>(`/project/projects/${projectId}/status`, { status });
  },

  transferProject: (projectId: string, destinationWorkspaceId: string) => {
    return apiClient.patch<any, ApiSuccess<Project>>(`/project/projects/${projectId}/transfer`, { destinationWorkspaceId });
  },

  getProjectAudits: (projectId: string, params?: { page?: number; limit?: number; action?: string; order?: 'asc' | 'desc' }) => {
    return apiClient.get<any, ApiSuccess<PaginatedAuditResponse>>(`/project/projects/${projectId}/audits`, { params });
  }
};
