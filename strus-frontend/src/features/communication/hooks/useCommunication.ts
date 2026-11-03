import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communicationService } from '../api/communication.service';

const key = (projectId: string) => ['communication', projectId] as const;

export const useProjectConversation = (projectId: string) => useQuery({
  queryKey: key(projectId),
  queryFn: async () => (await communicationService.getProjectConversation(projectId)).data,
  enabled: Boolean(projectId),
});

export const useConversationMessages = (projectId: string, conversationId?: string) => useQuery({
  queryKey: [...key(projectId), 'messages', conversationId],
  queryFn: async () => (await communicationService.getMessages(conversationId!)).data,
  enabled: Boolean(conversationId),
});

export const useSendMessage = (projectId: string, conversationId?: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ content, files }: { content: string; files: File[] }) => communicationService.sendMessage(conversationId!, content, files),
    onSuccess: () => client.invalidateQueries({ queryKey: [...key(projectId), 'messages', conversationId] }),
  });
};
