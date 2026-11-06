import { prisma } from "../../../core/database/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { MarkConversationReadDto } from "../dtos/mark-conversation-read.dto.js";
import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import type { SendMessageDto } from "../dtos/send-message.dto.js";
import type { MessageWithRelations } from "../types/message.types.js";
import type { GetConversationMessagesDto } from "../dtos/get-conversation-messages.dto.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import type { GetMessageDto } from "../dtos/get-message.dto.js"
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import type { UpdateMessageDto } from "../dtos/update-message.dto.js";
import type { DeleteMessageDto } from "../dtos/delete-message.dto.js";
import { MessageAttachmentService } from "./message-attachment.service.js";
import { MessageStatus } from "../../../generated/prisma/enums.js";
import type { GetReadReceiptsDto } from "../dtos/get-read-receipts.dto.js";
import type { ReadReceipt } from "../repositories/message.repository.js";
import { CommunicationSocket } from "../../../core/socket/communication.socket.js";
import { MessageMapper } from "../mappers/message.mapper.js";
import { CommunicationCache } from "../cache/conversation.cache.js";
import { WorkspaceRepository } from "../../workspace/repositories/workspace.repository.js";
import { WorkspaceRole } from "../../../generated/prisma/enums.js";


export class MessageService {
  static async sendMessage(
  dto: SendMessageDto,
  files: Express.Multer.File[],
  userId: string
): Promise<MessageWithRelations> {
  // ==================================================
  // Business Validation
  // ==================================================

  const content = dto.content?.trim() ?? "";

  const hasContent = content.length > 0;
  const hasAttachments = files.length > 0;

  if (!hasContent && !hasAttachments) {
    throw new AppError(
      "Message must contain text or attachments.",
      400,
      ErrorCode.INVALID_MESSAGE_CONTENT
    );
  }

  // ==================================================
  // Permission + Existence Check
  // ==================================================

  const conversation =
    await ConversationRepository.findWritableConversation(
      dto.conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Conversation not found or you do not have permission to send messages.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }

  // ==================================================
  // Reply Validation
  // ==================================================

  if (dto.replyToMessageId) {
    const replyTarget =
      await MessageRepository.findReplyTarget(
        conversation.id,
        dto.replyToMessageId
      );

    if (!replyTarget) {
      throw new AppError(
        "Reply target message not found.",
        404,
        ErrorCode.MESSAGE_NOT_FOUND
      );
    }
  }

  // ==================================================
  // Upload Attachments
  // ==================================================

  const uploadedAttachments = hasAttachments
    ? await MessageAttachmentService.uploadAttachments(files)
    : [];

  try {
  const message =
    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const sequence =
          await MessageRepository.getNextSequence(
            tx,
            dto.conversationId
          );

        const createdMessage =
          await MessageRepository.create(tx, {
            conversation: {
              connect: {
                id: dto.conversationId,
              },
            },

            sender: {
              connect: {
                id: userId,
              },
            },

            ...(dto.replyToMessageId && {
              replyTo: {
                connect: {
                  id: dto.replyToMessageId,
                },
              },
            }),

            sequence,

            type: dto.type,

            content,
          });

        if (uploadedAttachments.length > 0) {
          await MessageRepository.createAttachments(
            tx,
            uploadedAttachments.map(
              (attachment) => ({
                messageId: createdMessage.id,
                publicId: attachment.publicId,
                url: attachment.url,
                originalName:
                  attachment.originalName,
                mimeType:
                  attachment.mimeType,
                extension:
                  attachment.extension,
                attachmentType:
                  attachment.attachmentType,
                size: attachment.size,
              })
            )
          );
        }

        await ConversationRepository.touch(
          tx,
          dto.conversationId,
          createdMessage.id
        );

        return createdMessage;
      }
    );

  CommunicationSocket.emitMessageSent(
    dto.conversationId,
    {
      message:
        MessageMapper.toMessageResponse(
          message
        ),
    }
  );

  await CommunicationCache.invalidateConversation(
  message.conversation
);
  

  return message;
} catch (error) {
  await MessageAttachmentService.deleteAttachments(
    uploadedAttachments
  );

  throw error;

}
}

// ==================================================
// Get Conversation Messages
// ==================================================

static async getConversationMessages(
  dto: GetConversationMessagesDto,
  userId: string
): Promise<{
  messages: MessageWithRelations[];
  nextCursor: number | null;
  hasMore: boolean;
}> {
  // ==================================================
  // Permission + Existence Check
  // ==================================================

  const conversation =
    await ConversationRepository.findReadableConversation(
      dto.conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Conversation not found or you do not have permission to view messages.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }

  // ==================================================
  // Fetch Messages
  // ==================================================

  const {
    messages,
    hasMore,
  } = await MessageRepository.findConversationMessages(
    dto.conversationId,
    dto.cursor,
    dto.limit
  );

  // ==================================================
  // Pagination Metadata
  // ==================================================

  const nextCursor =
    messages.length > 0
      ? messages[0]!.sequence
      : null;

  return {
    messages,
    nextCursor,
    hasMore,
  };
}

// ==================================================
// Get Message
// ==================================================

static async getMessage(
  dto: GetMessageDto,
  userId: string
): Promise<MessageWithRelations> {
  const message =
    await MessageRepository.findAccessibleMessage(
      dto.messageId,
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

// ==================================================
// Update Message
// ==================================================

static async updateMessage(
  dto: UpdateMessageDto,
  userId: string
): Promise<MessageWithRelations> {
  // ==================================================
  // Permission + Existence Check
  // ==================================================

  const existingMessage =
    await MessageRepository.findEditableMessage(
      dto.messageId,
      userId
    );

  if (!existingMessage) {
    throw new AppError(
      "Message not found or you do not have permission to edit it.",
      404,
      ErrorCode.MESSAGE_NOT_FOUND
    );
  }

  // ==================================================
  // Normalize Content
  // ==================================================

  const content = dto.content.trim();

  if (existingMessage.content.trim() === content) {
    throw new AppError(
      "Message content is unchanged.",
      400,
      ErrorCode.INVALID_MESSAGE_CONTENT
    );
  }

  // ==================================================
  // Database Transaction
  // ==================================================

  const updatedMessage = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // ----------------------------------------------
      // Store Previous Version
      // ----------------------------------------------

      await MessageRepository.createEditHistory(tx, {
        message: {
          connect: {
            id: existingMessage.id,
          },
        },

        editedBy: {
          connect: {
            id: userId,
          },
        },

        previousContent: existingMessage.content,
      });

      // ----------------------------------------------
      // Update Message
      // ----------------------------------------------

      return MessageRepository.update(
        tx,
        existingMessage.id,
        {
          content,
          status: MessageStatus.EDITED,
        }
      );
    }
  );

  // ==================================================
  // Emit Socket Event
  // ==================================================

  CommunicationSocket.emitMessageUpdated(
    updatedMessage.conversationId,
    {
      message:
        MessageMapper.toMessageResponse(
          updatedMessage
        ),
    }
  );

  // ==================================================
  // Cache Invalidation
  // ==================================================

  await CommunicationCache.invalidateConversation(
    updatedMessage.conversation
  );

  return updatedMessage;
}
// ==================================================
// Delete Message
// ==================================================


static async deleteMessage(
  dto: DeleteMessageDto,
  userId: string
): Promise<void> {
  // 1. Find message and verify conversation membership.
  const message =
    await MessageRepository.findDeletableMessage(
      dto.messageId,
      userId
    );

  if (!message) {
    throw new AppError(
      "Message not found or you do not have permission to delete it.",
      404,
      ErrorCode.MESSAGE_NOT_FOUND
    );
  }

  // 2. Own messages can always be deleted.
  const isOwnMessage = message.senderId === userId;

  let canDelete = isOwnMessage;

  // 3. Apply Workspace moderation permissions.
  if (
    !isOwnMessage &&
    message.conversation.workspaceId
  ) {
    const workspaceId =
      message.conversation.workspaceId;

    const [actorMembership, senderMembership] =
      await Promise.all([
        WorkspaceRepository.findMember(
          workspaceId,
          userId
        ),
        WorkspaceRepository.findMember(
          workspaceId,
          message.senderId
        ),
      ]);

    if (actorMembership?.role === WorkspaceRole.OWNER) {
      // OWNER can delete ADMIN and MEMBER messages.
      canDelete = Boolean(senderMembership);
    } else if (
      actorMembership?.role === WorkspaceRole.ADMIN
    ) {
      // ADMIN can delete MEMBER messages only.
      canDelete =
        senderMembership?.role === WorkspaceRole.MEMBER;
    }
  }

  if (!canDelete) {
    throw new AppError(
      "You do not have permission to delete this message.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  // 4. Load attachments before deleting their metadata.
  const attachments =
    await MessageRepository.findAttachments(
      dto.messageId
    );

  // 5. Soft-delete inside a transaction.
  await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      await MessageRepository.deleteAttachments(
        tx,
        dto.messageId
      );

      await MessageRepository.softDelete(
        tx,
        dto.messageId
      );
    }
  );

  // 6. Best-effort Cloudinary cleanup.
  if (attachments.length > 0) {
    try {
      await MessageAttachmentService.deletePersistedAttachments(
        attachments
      );
    } catch (error) {
      console.error(
        "Failed to delete message attachments from Cloudinary.",
        error
      );
    }
  }

  // 7. Emit event after successful database transaction.
  CommunicationSocket.emitMessageDeleted(
    message.conversationId,
    {
      messageId: message.id,
      conversationId: message.conversationId,
      deletedAt: new Date(),
    }
  );

  // 8. Invalidate conversation cache.
  await CommunicationCache.invalidateConversation(
    message.conversation
  );
}


static async markConversationAsRead(
  dto: MarkConversationReadDto,
  userId: string
): Promise<void> {
  // ==================================================
  // Permission + Existence Check
  // ==================================================

  const conversation =
    await ConversationRepository.findReadableConversation(
      dto.conversationId,
      userId
    );

  if (!conversation) {
    throw new AppError(
      "Conversation not found or you do not have permission to access it.",
      404,
      ErrorCode.CONVERSATION_NOT_FOUND
    );
  }

  // ==================================================
  // Validate Read Sequence
  // ==================================================

  const latestSequence =
    await MessageRepository.getLatestSequence(
      dto.conversationId
    );

  if (
    latestSequence !== null &&
    dto.lastReadSequence > latestSequence
  ) {
    throw new AppError(
      "Invalid read sequence.",
      400,
      ErrorCode.INVALID_REQUEST
    );
  }

  // ==================================================
  // Update Read Pointer
  // ==================================================

  await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      await ConversationParticipantRepository.updateLastRead(
        tx,
        dto.conversationId,
        userId,
        dto.lastReadSequence
      );
    }
  );

CommunicationSocket.emitConversationRead(
  dto.conversationId,
  {
    conversationId: dto.conversationId,
    userId,
    lastReadSequence: dto.lastReadSequence,
    readAt: new Date(),
  }
);
}

// ==================================================
// Get Read Receipts
// ==================================================

static async getReadReceipts(
  dto: GetReadReceiptsDto,
  userId: string
): Promise<ReadReceipt[]> {
  // ==================================================
  // Permission + Existence Check
  // ==================================================

  const message =
    await MessageRepository.findAccessibleMessage(
      dto.messageId,
      userId
    );

  if (!message) {
    throw new AppError(
      "Message not found.",
      404,
      ErrorCode.MESSAGE_NOT_FOUND
    );
  }

  // ==================================================
  // Load Read Receipts
  // ==================================================

  const readReceipts =
    await MessageRepository.findReadReceipts(
      dto.messageId
    );

  return readReceipts ?? [];
}
}