
import { useQuery } from '@tanstack/react-query';

import { agreementService } from '../api/agreement.service';

import type {
  AgreementAuditAction,
  AuditOrder,
} from '../types/agreement.types';

export const agreementKeys = {
  all: (projectId: string) => ['agreement', projectId] as const,

  details: (projectId: string) =>
    [...agreementKeys.all(projectId), 'details'] as const,

  participants: (projectId: string) =>
    [...agreementKeys.all(projectId), 'participants'] as const,

  audits: (projectId: string) =>
    [...agreementKeys.all(projectId), 'audits'] as const,

  auditList: (
    projectId: string,
    filters: {
      page: number;
      limit: number;
      action?: AgreementAuditAction;
      order: AuditOrder;
    },
  ) => [...agreementKeys.audits(projectId), filters] as const,
};

export const useAgreement = (
  projectId: string,
  setupStage?: string,
) => {
  return useQuery({
    queryKey: agreementKeys.details(projectId),

    queryFn: async () => {
      const response = await agreementService.getAgreement(projectId);
      return response.data;
    },

    // Wait until project details are available.
    // Agreement creation itself seeds this query's cache.
    enabled: Boolean(projectId) &&
      Boolean(setupStage) &&
      setupStage !== 'PROJECT_CREATED',

    retry: (failureCount, error: any) => {
      if (error?.code === 'AGREEMENT_NOT_FOUND') {
        return false;
      }

      return failureCount < 3;
    },
  });
};

export const useAgreementParticipants = (
  projectId: string,
  setupStage?: string,
) => {
  return useQuery({
    queryKey: agreementKeys.participants(projectId),

    queryFn: async () => {
      const response = await agreementService.getParticipants(projectId);
      return response.data;
    },

    enabled: Boolean(projectId) &&
      Boolean(setupStage) &&
      setupStage !== 'PROJECT_CREATED',

    retry: (failureCount, error: any) => {
      if (error?.code === 'AGREEMENT_NOT_FOUND') {
        return false;
      }

      return failureCount < 3;
    },
  });
};

export const useAgreementAudits = (
  projectId: string,
  setupStage?: string,
  page = 1,
  limit = 20,
  action?: AgreementAuditAction,
  order: AuditOrder = 'desc',
) => {
  return useQuery({
    queryKey: agreementKeys.auditList(projectId, {
      page,
      limit,
      action,
      order,
    }),

    queryFn: async () => {
      const response = await agreementService.getAgreementAudits(
        projectId,
        page,
        limit,
        action,
        order,
      );

      return response.data;
    },

    enabled: Boolean(projectId) &&
      Boolean(setupStage) &&
      setupStage !== 'PROJECT_CREATED',
  });
};
