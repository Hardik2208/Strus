import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { socketManager } from '../../../core/realtime/socket-manager';
import { SOCKET_EVENTS } from '../../../core/realtime/socket-events';

import type {
  Message,
  MessagePage,
} from '../types/communication.types';

const projectMessagesKey = (
  projectId: string,
  conversationId: string
) => [
  'communication',
  'project',
  projectId,
  'messages',
  conversationId,
] as const;

interface MessageEventPayload {
  message: Message;
}

interface DeletedMessageEventPayload {
  messageId: string;
  conversationId: string;
  deletedAt: string;
}

export const useProjectCommunicationRealtime = (
  projectId: string,
  conversationId?: string
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || !conversationId) return;

    const messagesKey = projectMessagesKey(
      projectId,
      conversationId
    );

    const joinConversation = () => {
      socketManager.emit(
        SOCKET_EVENTS.CONVERSATION_JOINED,
        conversationId
      );

      queryClient.invalidateQueries({
        queryKey: messagesKey,
      });
    };

    socketManager.connect();

    const unsubscribeStatus =
      socketManager.onStatusChange((status) => {
        if (status === 'connected') {
          joinConversation();
        }
      });

    const unsubscribeMessageSent =
      socketManager.subscribe(
        SOCKET_EVENTS.MESSAGE_SENT,
        (event) => {
          const payload =
            event.data as MessageEventPayload;

          const message = payload?.message;

          if (
            !message ||
            message.conversationId !== conversationId
          ) {
            return;
          }

          queryClient.setQueryData(
            messagesKey,
            (oldData: any) => {
              if (!oldData?.pages?.length) {
                queryClient.invalidateQueries({
                  queryKey: messagesKey,
                });

                return oldData;
              }

              const exists = oldData.pages.some(
                (page: MessagePage) =>
                  page.messages.some(
                    (item) => item.id === message.id
                  )
              );

              if (exists) return oldData;

              const pages = [...oldData.pages];

              pages[0] = {
                ...pages[0],
                messages: [
                  ...pages[0].messages,
                  message,
                ],
              };

              return {
                ...oldData,
                pages,
              };
            }
          );
        }
      );

    const unsubscribeMessageUpdated =
      socketManager.subscribe(
        SOCKET_EVENTS.MESSAGE_UPDATED,
        (event) => {
          const payload =
            event.data as MessageEventPayload;

          const message = payload?.message;

          if (
            !message ||
            message.conversationId !== conversationId
          ) {
            return;
          }

          queryClient.setQueryData(
            messagesKey,
            (oldData: any) => {
              if (!oldData?.pages) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map(
                  (page: MessagePage) => ({
                    ...page,
                    messages: page.messages.map(
                      (item) =>
                        item.id === message.id
                          ? message
                          : item
                    ),
                  })
                ),
              };
            }
          );
        }
      );

    const unsubscribeMessageDeleted =
      socketManager.subscribe(
        SOCKET_EVENTS.MESSAGE_DELETED,
        (event) => {
          const payload =
            event.data as DeletedMessageEventPayload;

          if (
            !payload?.messageId ||
            payload.conversationId !== conversationId
          ) {
            return;
          }

          queryClient.setQueryData(
            messagesKey,
            (oldData: any) => {
              if (!oldData?.pages) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map(
                  (page: MessagePage) => ({
                    ...page,
                    messages: page.messages.map(
                      (message) =>
                        message.id === payload.messageId
                          ? {
                              ...message,
                              status: 'DELETED',
                              content: '[Message deleted]',
                              attachments: [],
                            }
                          : message
                    ),
                  })
                ),
              };
            }
          );
        }
      );

    return () => {
      unsubscribeStatus();
      unsubscribeMessageSent();
      unsubscribeMessageUpdated();
      unsubscribeMessageDeleted();

      socketManager.emit(
        SOCKET_EVENTS.CONVERSATION_LEFT,
        conversationId
      );
    };
  }, [projectId, conversationId, queryClient]);
};