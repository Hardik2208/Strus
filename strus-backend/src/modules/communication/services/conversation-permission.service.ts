import {
  ConversationStatus,
  MessageStatus,
} from "../../../generated/prisma/enums.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";


export class ConversationPermissionService {
  // ==================================================
  // Conversation Exists
  // ==================================================

  static async ensureConversationExists(
    conversationId: string
  ) {
    const conversation =
      await ConversationRepository.findById(
        conversationId
      );

    if (!conversation) {
      throw new AppError(
        "Conversation not found.",
        404,
        ErrorCode.CONVERSATION_NOT_FOUND
      );
    }

    return conversation;
  }

  // ==================================================
  // Conversation Access
  // ==================================================

  static async ensureConversationAccess(
  conversationId: string,
  userId: string
) {
  const conversation =
    await ConversationRepository.findAccessibleConversation(
      conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Conversation not found.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }

  return conversation;
}

  // ==================================================
// Conversation Writable
// ==================================================

static async ensureConversationWritable(
  conversationId: string,
  userId: string
) {
  const conversation =
    await ConversationRepository.findWritableConversation(
      conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Conversation is not writable.",
      400,
      ErrorCode.CONVERSATION_READ_ONLY
    );
  }

  return conversation;
}

// ==================================================
// Conversation Participant
// ==================================================

static async ensureConversationParticipant(
  conversationId: string,
  userId: string
) {
  return this.ensureConversationAccess(
    conversationId,
    userId
  );
}

// ==================================================
// Workspace Conversation Admin
// ==================================================

static async ensureWorkspaceConversationAdmin(
  conversationId: string,
  userId: string
) {
  const conversation =
    await ConversationRepository.findWorkspaceAdminConversation(
      conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Insufficient permissions.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  return conversation;
}

// ==================================================
// Message Editable
// ==================================================

static async ensureMessageEditable(
  messageId: string,
  userId: string
) {
  const message =
    await MessageRepository.findEditableMessage(
      messageId,
      userId
    );

  if (!message) {
    throw new AppError(
      "Message cannot be edited.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  return message;
}

// ==================================================
// Message Deletable
// ==================================================

static async ensureMessageDeletable(
  messageId: string,
  userId: string
) {
  const message =
    await MessageRepository.findDeletableMessage(
      messageId,
      userId
    );

  if (!message) {
    throw new AppError(
      "Message cannot be deleted.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  return message;
}

// ==================================================
// Message Read Access
// ==================================================

static async ensureMessageAccessible(
  messageId: string,
  userId: string
) {
  const message =
    await MessageRepository.findAccessibleMessage(
      messageId,
      userId
    );

  if (!message) {
    throw new AppError(
      "Message not found.",
      404,
      ErrorCode.MESSAGE_NOT_FOUND
    );
  }

  return message;
}
}