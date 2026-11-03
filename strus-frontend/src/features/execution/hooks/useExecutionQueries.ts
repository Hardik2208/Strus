import { useQuery } from '@tanstack/react-query';
import { executionService } from '../api/execution.service';

export const executionKeys = {
  all: (projectId: string) => ['execution', projectId] as const,
  plan: (projectId: string) => [...executionKeys.all(projectId), 'plan'] as const,
};

export const useExecutionPlan = (projectId: string, setupStage?: string) => {
  return useQuery({
    queryKey: executionKeys.plan(projectId),
    queryFn: async () => {
      const res = await executionService.getExecutionPlan(projectId);
      // backend wraps list in { success, data: [] }
      const raw = res.data as any;
      const milestones = Array.isArray(raw) ? raw : (raw?.data ?? []);
      return milestones;
    },
    enabled:
      !!projectId &&
      !!setupStage &&
      setupStage !== 'PROJECT_CREATED' &&
      setupStage !== 'AGREEMENT_COMPLETED',
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};
