
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { projectService } from '../api/project.service';
import { projectQueryKeys } from './useProjectQueries';

import type {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectStatus,
} from '../types/project.types';

/**
 * Refresh all frontend views affected by project mutations.
 *
 * projectQueryKeys.all covers:
 * - Workspace project lists
 * - Professional project lists
 * - Project details
 * - Project audit history
 */
const invalidateProjectViews = async (
  queryClient: ReturnType<typeof useQueryClient>
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: projectQueryKeys.all,
    }),

    queryClient.invalidateQueries({
      queryKey: ['dashboard', 'client'],
    }),

    queryClient.invalidateQueries({
      queryKey: ['dashboard', 'professional'],
    }),

    queryClient.invalidateQueries({
      queryKey: ['events', 'dashboard'],
    }),
  ]);
};

/**
 * Create Project
 */
export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) =>
      projectService.createProject(workspaceId, data),

    onSuccess: async () => {
      await invalidateProjectViews(queryClient);
    },
  });
};

/**
 * Update Project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateProjectDTO;
    }) => projectService.updateProject(projectId, data),

    onSuccess: async (_, { projectId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),

        invalidateProjectViews(queryClient),
      ]);
    },
  });
};

/**
 * Delete Project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      projectService.deleteProject(projectId),

    onSuccess: async (_, projectId) => {
      await Promise.all([
        queryClient.removeQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),

        invalidateProjectViews(queryClient),
      ]);
    },
  });
};

/**
 * Update Project Status
 */
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      status,
    }: {
      projectId: string;
      status: ProjectStatus;
    }) => projectService.updateProjectStatus(projectId, status),

    onSuccess: async (_, { projectId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),

        invalidateProjectViews(queryClient),
      ]);
    },
  });
};

/**
 * Transfer Project
 */
export const useTransferProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      destinationWorkspaceId,
    }: {
      projectId: string;
      destinationWorkspaceId: string;
    }) =>
      projectService.transferProject(
        projectId,
        destinationWorkspaceId
      ),

    onSuccess: async (_, { projectId }) => {
      await Promise.all([
        queryClient.removeQueries({
          queryKey: projectQueryKeys.detail(projectId),
        }),

        invalidateProjectViews(queryClient),
      ]);
    },
  });
};
