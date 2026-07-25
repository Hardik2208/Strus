import type { Prisma } from "../../../generated/prisma/client.js";

import type { ConversationResponse } from "../interfaces/conversation-response.interface.js";

export type ConversationSummary =
  Prisma.ConversationGetPayload<{
    select: {
      id: true;
      type: true;
      status: true;
      lastActivityAt: true;
      nextMessageSequence: true;

      workspace: {
        select: {
          id: true;
          name: true;
          workspaceType: true;
        };
      };

      project: {
        select: {
          id: true;
          title: true;
          status: true;
          setupStage: true;
        };
      };

      lastMessage: {
        select: {
          id: true;
          sequence: true;
          content: true;
          createdAt: true;

          sender: {
            select: {
              id: true;

              profile: {
                select: {
                  firstName: true;
                  lastName: true;
                  avatarUrl: true;
                };
              };
            };
          };
        };
      };

      participants: {
        select: {
          lastReadSequence: true;
          lastReadAt: true;
        };
      };
    };
  }> & {
    latestSequence: number;
    lastReadSequence: number;
    unreadCount: number;
  };

export class ConversationMapper {
  static toConversationResponse(
    conversation: ConversationSummary
  ): ConversationResponse {
    return {
      id: conversation.id,

      type: conversation.type,

      status: conversation.status,

      workspace: conversation.workspace,

      project: conversation.project,

      lastActivityAt:
        conversation.lastActivityAt,

      latestSequence:
        conversation.latestSequence,

      lastReadSequence:
        conversation.lastReadSequence,

      unreadCount:
        conversation.unreadCount,

      lastMessage: conversation.lastMessage
        ? {
            id: conversation.lastMessage.id,

            sequence:
              conversation.lastMessage.sequence,

            content:
              conversation.lastMessage.content,

            createdAt:
              conversation.lastMessage.createdAt,

            sender: {
              id:
                conversation.lastMessage.sender.id,

              profile:
                conversation.lastMessage.sender.profile
                  ? {
                      firstName:
                        conversation.lastMessage.sender.profile.firstName,

                      lastName:
                        conversation.lastMessage.sender.profile.lastName,

                      avatarUrl:
                        conversation.lastMessage.sender.profile.avatarUrl,
                    }
                  : null,
            },
          }
        : null,
    };
  }
}