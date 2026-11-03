import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { 
  Agreement, 
  AgreementParticipantsResponse,
  CreateAgreementRequest,
  UpdateAgreementRequest,
  InviteParticipantRequest,
  UpdateInvitationRequest,
  AgreementAuditResponse
} from '../types/agreement.types';

export const agreementService = {
  async getAgreement(projectId: string) {
    try {
      return await apiClient.get<any, ApiSuccess<Agreement>>(`/agreement/projects/${projectId}/agreement`);
    } catch (error: any) {
      if (error?.code === 'AGREEMENT_NOT_FOUND' || error?.status === 404) {
        return { data: null } as unknown as ApiSuccess<Agreement>;
      }
      throw error;
    }
  },

  async createAgreement(projectId: string, data: CreateAgreementRequest) {
    return apiClient.post<any, ApiSuccess<Agreement>>(`/agreement/projects/${projectId}/agreement`, data);
  },

  async updateAgreement(projectId: string, data: UpdateAgreementRequest) {
    return apiClient.patch<any, ApiSuccess<Agreement>>(`/agreement/projects/${projectId}/agreement`, data);
  },

  async getParticipants(projectId: string) {
    try {
      const res = await apiClient.get<any, ApiSuccess<any>>(`/agreement/projects/${projectId}/agreement/participants`);
      const participantsData = Array.isArray(res.data) ? { participants: res.data } : res.data;
      return { ...res, data: participantsData } as unknown as ApiSuccess<AgreementParticipantsResponse>;
    } catch (error: any) {
      if (error?.code === 'AGREEMENT_NOT_FOUND' || error?.status === 404) {
        return { data: { participants: [] } } as unknown as ApiSuccess<AgreementParticipantsResponse>;
      }
      throw error;
    }
  },

  async inviteProfessional(projectId: string, data: InviteParticipantRequest) {
    return apiClient.post<any, ApiSuccess<{ message: string }>>(`/agreement/projects/${projectId}/agreement/participants`, data);
  },

  async updateInvitationStatus(projectId: string, participantId: string, data: UpdateInvitationRequest) {
    return apiClient.patch<any, ApiSuccess<{ message: string }>>(`/agreement/projects/${projectId}/agreement/participants/${participantId}`, data);
  },

  async withdrawInvitation(projectId: string, participantId: string) {
    return apiClient.patch<any, ApiSuccess<{ message: string }>>(`/agreement/projects/${projectId}/agreement/participants/${participantId}/withdraw`, {});
  },

  async removeParticipant(projectId: string, participantId: string) {
    return apiClient.delete<any, ApiSuccess<{ message: string }>>(`/agreement/projects/${projectId}/agreement/participants/${participantId}`);
  },

  async getAgreementAudits(projectId: string, page = 1, limit = 20, action?: string) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (action && action !== 'All') {
      queryParams.append('action', action);
    }
    
    try {
      return await apiClient.get<any, ApiSuccess<AgreementAuditResponse>>(`/agreement/projects/${projectId}/agreement/audits?${queryParams.toString()}`);
    } catch (error: any) {
      if (error?.code === 'AGREEMENT_NOT_FOUND' || error?.status === 404) {
        return { data: { logs: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false } } } as unknown as ApiSuccess<AgreementAuditResponse>;
      }
      throw error;
    }
  },

  async getPendingInvitations(page = 1, limit = 20) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return await apiClient.get<any, ApiSuccess<any>>(`/agreement/invitations/pending?${queryParams.toString()}`);
  }
};
