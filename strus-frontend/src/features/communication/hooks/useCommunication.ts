import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { communicationService } from '../api/communication.service';

// Keep Workspace and Project conversation caches isolated.
const workspaceKey = (workspaceId: string) =>
  ['communication', 'workspace', workspaceId] as const;

const projectKey = (projectId: string) =>
  ['communication', 'project', projectId] as const;

// Message mutations can affect either Workspace or Project message caches.
// Invalidate the communication root to keep both views consistent.
const invalidateCommunication = (
  client: ReturnType<typeof useQueryClient>
) =>
  client.invalidateQueries({
    queryKey: ['communication'],
  });

// ------------------------------------------
// Workspace Communication
// ------------------------------------------

export const useWorkspaceConversation = (workspaceId: string) =>
  useQuery({
    queryKey: workspaceKey(workspaceId),
    queryFn: async () =>
      (await communicationService.getWorkspaceConversation(workspaceId)).data,
    enabled: Boolean(workspaceId),
  });

export const useWorkspaceConversationMessages = (
  workspaceId: string,
  conversationId?: string
) =>
  useInfiniteQuery({
    queryKey: [
      ...workspaceKey(workspaceId),
      'messages',
      conversationId,
    ],

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) =>
      (
        await communicationService.getMessages(
          conversationId!,
          pageParam
        )
      ).data,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(workspaceId && conversationId),
  });

export const useSendWorkspaceMessage = (
  workspaceId: string,
  conversationId?: string
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      files,
    }: {
      content: string;
      files: File[];
    }) =>
      communicationService.sendMessage(
        conversationId!,
        content,
        files
      ),

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [
          ...workspaceKey(workspaceId),
          'messages',
          conversationId,
        ],
      });

      client.invalidateQueries({
        queryKey: workspaceKey(workspaceId),
      });
    },
  });
};

// ------------------------------------------
// Project Communication
// Existing functionality preserved
// ------------------------------------------

export const useProjectConversation = (projectId: string) =>
  useQuery({
    queryKey: projectKey(projectId),
    queryFn: async () =>
      (await communicationService.getProjectConversation(projectId)).data,
    enabled: Boolean(projectId),
  });

export const useConversationMessages = (
  projectId: string,
  conversationId?: string
) =>
  useQuery({
    queryKey: [
      ...projectKey(projectId),
      'messages',
      conversationId,
    ],
    queryFn: async () =>
      (await communicationService.getMessages(conversationId!)).data,
    enabled: Boolean(conversationId),
  });

export const useSendMessage = (
  projectId: string,
  conversationId?: string
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      files,
    }: {
      content: string;
      files: File[];
    }) =>
      communicationService.sendMessage(
        conversationId!,
        content,
        files
      ),

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [
          ...projectKey(projectId),
          'messages',
          conversationId,
        ],
      });
    },
  });
};

// ------------------------------------------
// Shared Message Management
// Used by Workspace and Project conversations
// ------------------------------------------

export const useEditMessage = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) =>
      communicationService.editMessage(messageId, content),

    onSuccess: () => invalidateCommunication(client),
  });
};

export const useDeleteMessage = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      communicationService.deleteMessage(messageId),

    onSuccess: () => invalidateCommunication(client),
  });
};

export const useProjectConversationMessages = (
  projectId: string,
  conversationId?: string
) =>
  useInfiniteQuery({
    queryKey: [
      ...projectKey(projectId),
      'messages',
      conversationId,
    ],

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) =>
      (
        await communicationService.getMessages(
          conversationId!,
          pageParam
        )
      ).data,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,

    enabled: Boolean(projectId && conversationId),
  });

export const useSendProjectMessage = (
  projectId: string,
  conversationId?: string
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      files,
    }: {
      content: string;
      files: File[];
    }) =>
      communicationService.sendMessage(
        conversationId!,
        content,
        files
      ),

    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [
          ...projectKey(projectId),
          'messages',
          conversationId,
        ],
      });

      client.invalidateQueries({
        queryKey: projectKey(projectId),
      });
    },
  });
};