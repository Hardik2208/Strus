import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agreementService } from '../api/agreement.service';
import { projectQueryKeys } from '../../project/hooks/useProjectQueries';

export const agreementInvitationKeys = {
  all: ['agreement-invitations'] as const,
};

export const usePendingAgreementInvitations = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...agreementInvitationKeys.all, { page, limit }],
    queryFn: () => agreementService.getPendingInvitations(page, limit).then(res => res.data)
  });
};

export const useAcceptAgreementInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, participantId }: { projectId: string, participantId: string }) => 
      agreementService.updateInvitationStatus(projectId, participantId, { status: 'ACCEPTED' }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: agreementInvitationKeys.all });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
      // Invalidate dashboard active projects
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
};

export const useDeclineAgreementInvitation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, participantId }: { projectId: string, participantId: string }) => 
      agreementService.updateInvitationStatus(projectId, participantId, { status: 'DECLINED' }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: agreementInvitationKeys.all });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
    }
  });
};
