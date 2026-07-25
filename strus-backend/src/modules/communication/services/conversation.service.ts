import {  ConversationType } from "../../../generated/prisma/enums.js";
import { ConversationMapper } from "../mappers/conversation.mapper.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { CommunicationCache } from "../cache/conversation.cache.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import type { ConversationResponse } from "../interfaces/conversation-response.interface.js";

export class ConversationService {
  private static calculateConversationState(
  conversation: {
    nextMessageSequence: number;
    participants: {
      lastReadSequence: number | null;
    }[];
  }
) {
  const participant = conversation.participants[0];

  const lastReadSequence =
    participant?.lastReadSequence ?? 0;

  const latestSequence =
    conversation.nextMessageSequence - 1;

  return {
    latestSequence,
    lastReadSequence,
    unreadCount: Math.max(
      latestSequence - lastReadSequence,
      0
    ),
  };
}
  static async initializeWorkspaceConversation(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  memberIds: string[]
) {
  const conversation =
    await ConversationRepository.create(
      tx,
      {
        type: ConversationType.WORKSPACE,

        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      }
    );

  await ConversationParticipantRepository.createMany(
    tx,
    memberIds.map((userId) => ({
      conversationId: conversation.id,
      userId,
    }))
  );

  return conversation;
}

static async initializeProjectConversation(
  tx: Prisma.TransactionClient,
  projectId: string,
  participantIds: string[]
) {
  const conversation =
    await ConversationRepository.create(
      tx,
      {
        type: ConversationType.PROJECT,

        project: {
          connect: {
            id: projectId,
          },
        },
      }
    );

  await ConversationParticipantRepository.createMany(
    tx,
    participantIds.map((userId) => ({
      conversationId: conversation.id,
      userId,
    }))
  );

  return conversation;
}


static async syncWorkspaceParticipants(
  tx: Prisma.TransactionClient,
  conversationId: string,
  addedMemberIds: string[],
  removedMemberIds: string[]
) {
  if (addedMemberIds.length > 0) {
    await ConversationParticipantRepository.createMany(
      tx,
      addedMemberIds.map((userId) => ({
        conversationId,
        userId,
      }))
    );
  }

  if (removedMemberIds.length > 0) {
    await ConversationParticipantRepository.deleteMany(
      tx,
      conversationId,
      removedMemberIds
    );
  }
}

static async syncProjectParticipants(
  tx: Prisma.TransactionClient,
  conversationId: string,
  addedParticipantIds: string[],
  removedParticipantIds: string[]
) {
  if (addedParticipantIds.length > 0) {
    await ConversationParticipantRepository.createMany(
      tx,
      addedParticipantIds.map((userId) => ({
        conversationId,
        userId,
      }))
    );
  }

  if (removedParticipantIds.length > 0) {
    await ConversationParticipantRepository.deleteMany(
      tx,
      conversationId,
      removedParticipantIds
    );
  }
}

static async getWorkspaceConversation(
  workspaceId: string,
  userId: string
): Promise<ConversationResponse> {
  // ------------------------------------------
  // Cache
  // ------------------------------------------

  const cached =
    await CommunicationCache.getWorkspaceConversation(
      workspaceId
    );

  if (cached) {
    return cached;
  }

  // ------------------------------------------
  // Database
  // ------------------------------------------

  const conversation =
    await ConversationRepository.findByWorkspaceId(
      workspaceId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Workspace conversation not found.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }
const response =
  ConversationMapper.toConversationResponse({
    ...conversation,
    ...this.calculateConversationState(
      conversation
    ),
  });

  // ------------------------------------------
  // Cache
  // ------------------------------------------

  await CommunicationCache.setWorkspaceConversation(
    workspaceId,
    response
  );

  return response;
}

static async getProjectConversation(
  projectId: string,
  userId: string
): Promise<ConversationResponse> {
  // ------------------------------------------
  // Cache
  // ------------------------------------------

  const cached =
    await CommunicationCache.getProjectConversation(
      projectId
    );

  if (cached) {
    return cached;
  }

  // ------------------------------------------
  // Database
  // ------------------------------------------

  const conversation =
    await ConversationRepository.findByProjectId(
      projectId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Project conversation not found.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }
const response =
  ConversationMapper.toConversationResponse({
    ...conversation,
    ...this.calculateConversationState(
      conversation
    ),
  });

  // ------------------------------------------
  // Cache
  // ------------------------------------------

  await CommunicationCache.setProjectConversation(
    projectId,
    response
  );

  return response;
}
}