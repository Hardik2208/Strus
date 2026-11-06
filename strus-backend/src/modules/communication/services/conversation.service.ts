import {  ConversationType } from "../../../generated/prisma/enums.js";
import { ConversationMapper } from "../mappers/conversation.mapper.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { CommunicationCache } from "../cache/conversation.cache.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import type { ConversationResponse } from "../interfaces/conversation-response.interface.js";
import { prisma } from "../../../core/database/prisma.js";
import { ProjectPermissionService } from "../../project/services/project-permission.service.js";
import { ProjectConversationService } from "./project-conversation.service.js";

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
  // ==================================================
  // 1. Verify current user's conversation membership
  // ==================================================

  const participantState =
    await ConversationRepository.findProjectParticipantState(
      projectId,
      userId
    );

  if (!participantState) {
    throw new AppError(
      "Project conversation not found.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }

  // ==================================================
  // 2. Read shared metadata from Redis
  // ==================================================

  let metadata =
    await CommunicationCache.getProjectConversationMetadata(
      projectId
    );

  // ==================================================
  // 3. Cache miss: fetch metadata from PostgreSQL
  // ==================================================

  if (
    !metadata ||
    metadata.id !== participantState.id
  ) {
    metadata =
      await ConversationRepository.findProjectMetadata(
        projectId
      );

    if (!metadata) {
      throw new AppError(
        "Project conversation not found.",
        404,
        ErrorCode.CONVERSATION_NOT_FOUND
      );
    }

    // Protect against stale cache entries after
    // conversation replacement or repair.
    if (metadata.id !== participantState.id) {
      await CommunicationCache.invalidateProjectConversation(
        projectId
      );

      throw new AppError(
        "Project conversation state is inconsistent.",
        409,
        ErrorCode.CONVERSATION_NOT_FOUND
      );
    }

    await CommunicationCache.setProjectConversationMetadata(
      projectId,
      {
        id: metadata.id,
        type: metadata.type,
        status: metadata.status,
        workspace: metadata.workspace,
        project: metadata.project,
        lastActivityAt: metadata.lastActivityAt,
        lastMessage: metadata.lastMessage,
      }
    );
  }

  // ==================================================
  // 4. Calculate fresh user-specific read state
  // ==================================================

  const latestSequence =
    participantState.nextMessageSequence - 1;

  const lastReadSequence =
    participantState.participants[0]
      ?.lastReadSequence ?? 0;

  const unreadCount = Math.max(
    latestSequence - lastReadSequence,
    0
  );

  // ==================================================
  // 5. Return combined response
  // ==================================================

  return {
    ...metadata,

    latestSequence,

    lastReadSequence,

    unreadCount,
  };
}
}