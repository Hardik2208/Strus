import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { agreementService } from '../api/agreement.service';
import { projectQueryKeys } from '../../project/hooks/useProjectQueries';

export const agreementInvitationKeys = {
  all: ['agreement-invitations'] as const,

  list: (page: number, limit: number) =>
    [...agreementInvitationKeys.all, { page, limit }] as const,
};

export const usePendingAgreementInvitations = (
  page = 1,
  limit = 20,
) => {
  return useQuery({
    queryKey: agreementInvitationKeys.list(page, limit),

    queryFn: () =>
      agreementService
        .getPendingInvitations(page, limit)
        .then((res) => res.data),

    enabled: true,
    staleTime: 30 * 1000,
  });
};

export const useAcceptAgreementInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      participantId,
    }: {
      projectId: string;
      participantId: string;
    }) =>
      agreementService.updateInvitationStatus(
        projectId,
        participantId,
        { status: 'ACCEPTED' },
      ),

    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: agreementInvitationKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(projectId),
      });

      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
    },
  });
};

export const useDeclineAgreementInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      participantId,
    }: {
      projectId: string;
      participantId: string;
    }) =>
      agreementService.updateInvitationStatus(
        projectId,
        participantId,
        { status: 'DECLINED' },
      ),

    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: agreementInvitationKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: projectQueryKeys.detail(projectId),
      });
    },
  });
};