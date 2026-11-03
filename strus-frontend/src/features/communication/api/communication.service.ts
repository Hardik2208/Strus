import { apiClient } from '../../../lib/api/api-client';
import type { ApiSuccess } from '../../../lib/api/api-error';
import type { Conversation, Message, MessagePage } from '../types/communication.types';

export const communicationService = {
  getProjectConversation: (projectId: string) =>
    apiClient.get<any, ApiSuccess<Conversation>>(`/communication/projects/${projectId}/conversation`),
  getMessages: (conversationId: string, cursor?: string) =>
    apiClient.get<any, ApiSuccess<MessagePage>>(`/communication/conversations/${conversationId}/messages${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
  sendMessage: (conversationId: string, content: string, files: File[]) => {
    const form = new FormData();
    if (content.trim()) form.append('content', content.trim());
    files.forEach((file) => form.append('files', file));
    return apiClient.post<any, ApiSuccess<Message>>(`/communication/conversations/${conversationId}/messages`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  markRead: (conversationId: string, sequence: number) =>
    apiClient.patch(`/communication/conversations/${conversationId}/read`, { lastReadSequence: sequence }),
  deleteMessage: (messageId: string) => apiClient.delete(`/communication/messages/${messageId}`),
};
