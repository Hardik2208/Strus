import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';

export const resolutionService = {
  getNegotiations: (milestoneId: string) => apiClient.get<any, ApiSuccess<any>>(`/negotiation/milestones/${milestoneId}/negotiations`),
  createNegotiation: (milestoneId: string, payload: { proposedPercentage: number; proposedAmount?: number; reason: string }) => apiClient.post(`/negotiation/milestones/${milestoneId}/negotiations`, payload),
  acceptNegotiation: (id: string) => apiClient.patch(`/negotiation/${id}/accept`),
  declineNegotiation: (id: string) => apiClient.patch(`/negotiation/${id}/decline`),
  getDisputes: (milestoneId: string) => apiClient.get<any, ApiSuccess<any>>(`/disputes/milestones/${milestoneId}`),
  createDispute: (milestoneId: string, payload: { reason: string; requestedResolution?: string }) => apiClient.post(`/disputes/milestones/${milestoneId}`, payload),
  respondToActionRequest: (actionRequestId: string, decision: 'CONTINUE' | 'TERMINATE') => apiClient.post(`/action-requests/${actionRequestId}/respond`, { decision }),
};
