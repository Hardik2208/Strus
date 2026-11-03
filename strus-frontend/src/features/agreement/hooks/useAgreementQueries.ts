import { useQuery } from '@tanstack/react-query';
import { agreementService } from '../api/agreement.service';

export const agreementKeys = {
  all: (projectId: string) => ['agreement', projectId] as const,
  details: (projectId: string) => [...agreementKeys.all(projectId), 'details'] as const,
  participants: (projectId: string) => [...agreementKeys.all(projectId), 'participants'] as const,
  audits: (projectId: string) => [...agreementKeys.all(projectId), 'audits'] as const,
  auditList: (projectId: string, filters: { page: number; limit: number; action?: string }) => 
    [...agreementKeys.audits(projectId), filters] as const,
};

export const useAgreement = (projectId: string, setupStage?: string) => {
  return useQuery({
    queryKey: agreementKeys.details(projectId),
    queryFn: () => agreementService.getAgreement(projectId).then(res => res.data),
    enabled: !!projectId && setupStage !== 'PROJECT_CREATED',
    retry: (failureCount, error: any) => {
      // Don't retry if the agreement isn't created yet (404)
      if (error?.code === 'AGREEMENT_NOT_FOUND' || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useAgreementParticipants = (projectId: string, setupStage?: string) => {
  return useQuery({
    queryKey: agreementKeys.participants(projectId),
    queryFn: () => agreementService.getParticipants(projectId).then(res => res.data),
    enabled: !!projectId && setupStage !== 'PROJECT_CREATED',
    retry: (failureCount, error: any) => {
      if (error?.code === 'AGREEMENT_NOT_FOUND' || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useAgreementAudits = (projectId: string, setupStage?: string, page = 1, limit = 20, action?: string) => {
  return useQuery({
    queryKey: agreementKeys.auditList(projectId, { page, limit, action }),
    queryFn: () => agreementService.getAgreementAudits(projectId, page, limit, action).then(res => res.data),
    enabled: !!projectId && setupStage !== 'PROJECT_CREATED',
  });
};
