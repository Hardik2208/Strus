import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agreementService } from '../api/agreement.service';
import type { 
  CreateAgreementRequest, 
  UpdateAgreementRequest, 
  InviteParticipantRequest, 
  UpdateInvitationRequest 
} from '../types/agreement.types';
import { agreementKeys } from './useAgreementQueries';
import { projectQueryKeys } from '../../project/hooks/useProjectQueries';

export const useCreateAgreement = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAgreementRequest) => agreementService.createAgreement(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.details(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
    }
  });
};

export const useUpdateAgreement = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateAgreementRequest) => agreementService.updateAgreement(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.details(projectId) });
      queryClient.invalidateQueries({ queryKey: agreementKeys.audits(projectId) });
    }
  });
};

export const useInviteProfessional = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InviteParticipantRequest) => agreementService.inviteProfessional(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      queryClient.invalidateQueries({ queryKey: agreementKeys.audits(projectId) });
    }
  });
};

export const useUpdateInvitationStatus = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ participantId, data }: { participantId: string, data: UpdateInvitationRequest }) => 
      agreementService.updateInvitationStatus(projectId, participantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      queryClient.invalidateQueries({ queryKey: agreementKeys.audits(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
    }
  });
};

export const useWithdrawInvitation = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (participantId: string) => agreementService.withdrawInvitation(projectId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      queryClient.invalidateQueries({ queryKey: agreementKeys.audits(projectId) });
    }
  });
};

export const useRemoveParticipant = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (participantId: string) => agreementService.removeParticipant(projectId, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agreementKeys.participants(projectId) });
      queryClient.invalidateQueries({ queryKey: agreementKeys.audits(projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(projectId) });
    }
  });
};
