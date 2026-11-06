
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socketManager } from "../../../core/realtime/socket-manager";
import { SOCKET_EVENTS } from "../../../core/realtime/socket-events";

import type {
  Message,
  MessagePage,
} from "../types/communication.types";

const workspaceMessagesKey = (
  workspaceId: string,
  conversationId: string
) => [
  "communication",
  "workspace",
  workspaceId,
  "messages",
  conversationId,
] as const;

const workspaceConversationKey = (workspaceId: string) => [
  "communication",
  "workspace",
  workspaceId,
] as const;

interface MessageEventPayload {
  message: Message;
}

interface DeletedMessageEventPayload {
  messageId: string;
  conversationId: string;
  deletedAt: string;
}

interface ReadEventPayload {
  conversationId: string;
  userId: string;
  lastReadSequence: number;
  readAt: string;
}

export const useWorkspaceCommunicationRealtime = (
  workspaceId: string,
  conversationId?: string
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workspaceId || !conversationId) {
      return;
    }

    const messagesKey = workspaceMessagesKey(
      workspaceId,
      conversationId
    );

    const joinConversation = () => {
      socketManager.emit(
        SOCKET_EVENTS.CONVERSATION_JOINED,
        conversationId
      );

      // Socket.IO does not replay events missed while disconnected.
      queryClient.invalidateQueries({
        queryKey: messagesKey,
      });

      queryClient.invalidateQueries({
        queryKey: workspaceConversationKey(workspaceId),
      });
    };

    // Connect is idempotent in the existing singleton.
    socketManager.connect();

    // Join immediately if already connected.
    const unsubscribeStatus = socketManager.onStatusChange(
      (status) => {
        if (status === "connected") {
          joinConversation();
        }
      }
    );

    const unsubscribeMessageSent = socketManager.subscribe(
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

            const alreadyExists = oldData.pages.some(
              (page: MessagePage) =>
                page.messages.some(
                  (item) => item.id === message.id
                )
            );

            if (alreadyExists) {
              return oldData;
            }

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

        queryClient.invalidateQueries({
          queryKey: workspaceConversationKey(workspaceId),
        });
      }
    );

    const unsubscribeMessageUpdated = socketManager.subscribe(
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

    const unsubscribeMessageDeleted = socketManager.subscribe(
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
                            status: "DELETED",
                            content: "[Message deleted]",
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

    const unsubscribeMessageRead = socketManager.subscribe(
      SOCKET_EVENTS.MESSAGE_READ,
      (event) => {
        const payload =
          event.data as ReadEventPayload;

        if (
          !payload ||
          payload.conversationId !== conversationId
        ) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: workspaceConversationKey(workspaceId),
        });
      }
    );

    return () => {
      unsubscribeStatus();
      unsubscribeMessageSent();
      unsubscribeMessageUpdated();
      unsubscribeMessageDeleted();
      unsubscribeMessageRead();

      socketManager.emit(
        SOCKET_EVENTS.CONVERSATION_LEFT,
        conversationId
      );
    };
  }, [workspaceId, conversationId, queryClient]);
};
