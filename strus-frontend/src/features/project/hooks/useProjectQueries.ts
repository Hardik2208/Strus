import { useQuery } from '@tanstack/react-query';
import { projectService } from '../api/project.service';
import type { ProjectListParams } from '../types/project.types';

export const projectQueryKeys = {
  all: ['projects'] as const,
  professionalLists: () => [...projectQueryKeys.all, 'professional-list'] as const,
  professionalList: (params?: ProjectListParams) => [...projectQueryKeys.professionalLists(), params] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (workspaceId: string, params?: ProjectListParams) => [...projectQueryKeys.lists(), workspaceId, params] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (projectId: string) => [...projectQueryKeys.details(), projectId] as const,
  audits: (projectId: string) => [...projectQueryKeys.detail(projectId), 'audits'] as const,
};

export const useProfessionalProjects = (params?: ProjectListParams, enabled = true) => {
  return useQuery({
    queryKey: projectQueryKeys.professionalList(params),
    queryFn: async () => {
      const { data } = await projectService.getProfessionalProjects(params);
      return data;
    },
    enabled: enabled,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useWorkspaceProjects = (workspaceId: string, params?: ProjectListParams, enabled = true) => {
  return useQuery({
    queryKey: projectQueryKeys.list(workspaceId, params),
    queryFn: async () => {
      const { data } = await projectService.getWorkspaceProjects(workspaceId, params);
      return data;
    },
    enabled: enabled && !!workspaceId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useProjectDetail = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: projectQueryKeys.detail(projectId),
    queryFn: async () => {
      const { data } = await projectService.getProject(projectId);
      return data;
    },
    enabled: enabled && !!projectId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useProjectAudits = (projectId: string, params?: { page?: number; limit?: number; action?: string; order?: 'asc' | 'desc' }, enabled = true) => {
  return useQuery({
    queryKey: [...projectQueryKeys.audits(projectId), params],
    queryFn: async () => {
      const { data } = await projectService.getProjectAudits(projectId, params);
      return data;
    },
    enabled: enabled && !!projectId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};
