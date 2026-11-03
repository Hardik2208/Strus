import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../api/project.service';
import { projectQueryKeys } from './useProjectQueries';
import type { CreateProjectDTO, UpdateProjectDTO, ProjectStatus } from '../types/project.types';

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectService.createProject(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: UpdateProjectDTO }) => 
      projectService.updateProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: ProjectStatus }) => 
      projectService.updateProjectStatus(projectId, status),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.audits(projectId) });
    },
  });
};

export const useTransferProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, destinationWorkspaceId }: { projectId: string; destinationWorkspaceId: string }) => 
      projectService.transferProject(projectId, destinationWorkspaceId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() }); // invalidates all lists, old and new workspaces
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.audits(projectId) });
    },
  });
};
