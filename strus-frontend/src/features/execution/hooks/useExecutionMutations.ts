import { useMutation, useQueryClient } from '@tanstack/react-query';
import { executionService } from '../api/execution.service';
import { executionKeys } from './useExecutionQueries';
import type { CreateExecutionPlanDto } from '../types/execution.types';

export const useCreateExecutionPlan = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExecutionPlanDto) =>
      executionService.createExecutionPlan(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: executionKeys.plan(projectId) });
      // Also invalidate the project detail so setup stage updates
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

export const useUpdateExecutionPlan = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExecutionPlanDto) =>
      executionService.updateExecutionPlan(projectId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: executionKeys.plan(projectId) });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};

export const useDeleteExecutionPlan = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => executionService.deleteExecutionPlan(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: executionKeys.plan(projectId) });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
};
